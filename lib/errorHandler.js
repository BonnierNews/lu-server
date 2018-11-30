"use strict";

const config = require("exp-config");
const util = require("util");
const logger = require("lu-logger")(config.logging);

function errorHandler(err, req, res, next) {
  const correlationId = res.get("correlation-id");
  if (!err) return next();
  let errorMessage = err instanceof Error ? err.toString() : JSON.stringify(err);
  logger.error(util.format("Error received in errorHandler:", err, correlationId, req.path), {
    meta: {correlationId}
  });

  if (config.envName === "production") {
    errorMessage = `Internal error! Request id: ${correlationId}`;
  }

  const errors = [
    {
      status: "500",
      title: "Server Error",
      source: `${req.path}`,
      detail: `${req.method} ${req.path}: ${errorMessage}`
    }
  ];

  if (config.boolean("showErrorStackOnRequests")) {
    errors[0].source = err.stack;
  }

  res.status(500).json({errors, meta: {correlationId}});
}
module.exports = errorHandler;
