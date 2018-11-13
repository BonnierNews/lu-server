"use strict";

const GracefulShutdownManager = require("@moebius/http-graceful-shutdown").GracefulShutdownManager;

const config = require("exp-config");
const logger = require("lu-logger")(config.logging);

function shutdownHandler(server) {
  const shutdownManager = new GracefulShutdownManager(server);
  return () => new Promise((resolve) => {
    shutdownManager.terminate(() => {
      logger.info("Server is gracefully terminated");
      resolve();
    });
  });
}

module.exports = shutdownHandler;
