import { logger } from "lu-logger";
import { GracefulShutdownManager } from "@moebius/http-graceful-shutdown";

import { shutdownDebugMeta } from "./handle-sigterm.js";

export default function shutdownHandler(server) {
  const shutdownManager = new GracefulShutdownManager(server);
  return () =>
    new Promise((resolve) => {
      shutdownManager.terminate(() => {
        logger.info("Server is gracefully terminated", shutdownDebugMeta());
        resolve();
      });
    });
}
