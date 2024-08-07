import config from "exp-config";
import { logger } from "lu-logger";
import * as uuid from "uuid";

let shuttingDown = false;
let shuttingDownDebugMeta;
// Should match kubernetes readiness. Configure in .ohoyconf and they will be exposed as env
const failureThreshold = asNum(config.READINESSCHECK_FAILURETHRESHOLD, 2);
const periodSeconds = asNum(config.READINESSCHECK_PERIODSECONDS, 6);

let stopConsumers = () => Promise.resolve();
let terminateServer = () => Promise.resolve();

export function initHandleSigterm() {
  logger.info(`initiating sigterm handler, failureThreshold ${failureThreshold}, periodSeconds ${periodSeconds}`);
  let secondsMultiplier = 1000;
  let sigtermEvent = "SIGTERM";
  if (config.envName === "test") {
    secondsMultiplier = 1;
    sigtermEvent = "test-SIGTERM";
  }
  process.on(sigtermEvent, async () => {
    logger.info("SIGTERM received");
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    shuttingDownDebugMeta = { correlationId: uuid.v4() };
    logger.info("start handling the sigterm, shutting down", shuttingDownDebugMeta);
    await setTimeout(
      async () => {
        logger.info("emptying app", shuttingDownDebugMeta);
        try {
          await Promise.all([ stopConsumers(1000), terminateServer() ]);
          if (config.envName === "test") {
            process.emit("test-exit");
          } else {
            process.exit(0); // eslint-disable-line n/no-process-exit
          }
        } catch (error) {
          logger.error(`Failed graceful shutdown: ${JSON.stringify(error.stack)}`, shuttingDownDebugMeta);
          process.exit(1); // eslint-disable-line n/no-process-exit
        }
      },
      periodSeconds * failureThreshold * secondsMultiplier + 2 * secondsMultiplier
    );
  });
}

function asNum(val, fallback) {
  if (isNaN(val)) return fallback;
  const num = Number(val);
  if (isNaN(num) || num < 1) return fallback;
  return num;
}

export function registerConsumerShutdown(callback) {
  stopConsumers = callback;
}

export function registerServerTerminator(terminator) {
  terminateServer = terminator;
}

export function isShuttingDown() {
  return shuttingDown;
}

export function shutdownDebugMeta() {
  return shuttingDownDebugMeta;
}
