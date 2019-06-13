"use strict";

const config = require("exp-config");
const util = require("util");
const {logger} = require("lu-logger");

function errorHandler(err, req, res, next) {
  const correlationId = req.correlationId;
  if (!err) return next();

  if (!(err instanceof Error) && err.statusCode) {
    return res.status(err.statusCode).json({errorMessage: err.message, meta: req.debugMeta});
  }

  let errorMessage = err instanceof Error ? err.toString() : JSON.stringify(err);
  logger.error(util.format("Error received in errorHandler:", err, correlationId, req.originalUrl), req.debugMeta);

  if (config.envName === "production") {
    errorMessage = `Internal error! Request id: ${correlationId}`;
  }

  const errors = [
    {
      status: "500",
      title: "Server Error",
      source: `${req.originalUrl}`,
      detail: `${req.method} ${req.originalUrl}: ${errorMessage}`
    }
  ];

  if (config.boolean("showErrorStackOnRequests")) {
    errors[0].source = err.stack;
  }

  res.status(500).json({errors, meta: req.debugMeta});
}
module.exports = errorHandler;
