"use strict";

const config = require("exp-config");
const logger = require("lu-logger")(config.logging);

function errorHandler(err, req, res, next) {
  if (!err) return next();
  let errorMessage = err instanceof Error ? err.toString() : JSON.stringify(err);
  logger.error(`Error received in errorHandler: ${errorMessage}`, req.correlationId);

  if (config.envName === "production") {
    errorMessage = `Internal error! Request id: ${req.correlationId}`;
  }

  res.status(500).send({
    error: errorMessage
  });
}

module.exports = errorHandler;
