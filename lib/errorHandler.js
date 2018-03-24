"use strict";

const config = require("exp-config");
const logger = require("lu-logger")(config.logging);
const express = require("express");

function errorHandler(err, req, res, next) {
  if (!err) return next();
  let errorMessage = err instanceof Error ? err.toString() : JSON.stringify(err);
  logger.error(`Error received in errorHandler: ${errorMessage}`, req.correlationId, req.path);

  if (config.envName === "production") {
    errorMessage = `Internal error! Request id: ${req.correlationId}`;
  }

  const errors = [{
    status: "500",
    title: "Server Error",
    source: `${req.path}`,
    detail: `${req.method} ${req.path}: ${errorMessage}`
  }];

  if (config.boolean("showErrorStackOnRequests")) {
    errors[0].source = err.stack;
  }

  res.status(500).json({ errors });
}


const router = express.Router(); // eslint-disable-line new-cap
router.use(errorHandler);

module.exports = errorHandler;
