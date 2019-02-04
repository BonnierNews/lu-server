"use strict";

const GracefulShutdownManager = require("@moebius/http-graceful-shutdown").GracefulShutdownManager;
const {logger} = require("lu-logger");

function shutdownHandler(server) {
  const shutdownManager = new GracefulShutdownManager(server);
  return () =>
    new Promise((resolve) => {
      shutdownManager.terminate(() => {
        logger.info("Server is gracefully terminated");
        resolve();
      });
    });
}

module.exports = shutdownHandler;
