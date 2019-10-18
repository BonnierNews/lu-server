"use strict";

const GracefulShutdownManager = require("@moebius/http-graceful-shutdown").GracefulShutdownManager;
const shutdownDebugMeta = require("./handle-sigterm").shutdownDebugMeta;
const {logger} = require("lu-logger");

function shutdownHandler(server) {
  const shutdownManager = new GracefulShutdownManager(server);
  return () =>
    new Promise((resolve) => {
      shutdownManager.terminate(() => {
        logger.info("Server is gracefully terminated", shutdownDebugMeta);
        resolve();
      });
    });
}

module.exports = shutdownHandler;
