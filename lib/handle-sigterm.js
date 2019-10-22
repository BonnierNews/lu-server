"use strict";
const config = require("exp-config");
const {logger} = require("lu-logger");
const uuid = require("uuid");
let shuttingDown = false;
let shuttingDownDebugMeta;
//should match kubernetes readiness. should be moved to envs but
//there is no nice way to do it w/o copypasting in depoyment yaml.
const failureThreshold = 2;
const periodSeconds = 6;

let stopConsumers = () => Promise.resolve();
let terminateServer = () => Promise.resolve();

function initHandleSigterm() {
  logger.info("initiating sigterm handler");
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
    shuttingDownDebugMeta = {
      correlationId: uuid.v4()
    };
    logger.info("start handling the sigterm, shutting down", shuttingDownDebugMeta);
    await setTimeout(async () => {
      logger.info("emptying app", shuttingDownDebugMeta);
      try {
        await Promise.all([stopConsumers(1000), terminateServer()]);
        if (config.envName === "test") {
          process.emit("test-exit");
        } else {
          process.exit(0); // eslint-disable-line no-process-exit
        }
      } catch (error) {
        logger.error(`Failed graceful shutdown: ${JSON.stringify(error.stack)}`, shuttingDownDebugMeta);
        process.exit(1); // eslint-disable-line no-process-exit
      }
    }, periodSeconds * failureThreshold * secondsMultiplier + 2 * secondsMultiplier);
  });
}

function registerConsumerShutdown(callback) {
  stopConsumers = callback;
}
function registerServerTerminator(terminator) {
  terminateServer = terminator;
}

function isShuttingDown() {
  return shuttingDown;
}

function shutdownDebugMeta() {
  return shuttingDownDebugMeta;
}
module.exports = {
  initHandleSigterm,
  registerConsumerShutdown,
  registerServerTerminator,
  isShuttingDown,
  shutdownDebugMeta
};
