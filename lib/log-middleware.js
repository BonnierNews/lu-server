"use strict";
const uuid = require("uuid");
const isHealthOrMetricRequest = require("./is-health-or-metric-request");
const {logger} = require("lu-logger");

function correlationLog(req, res, next) {
  let correlationId = req.get("correlation-id") || req.get("x-correlation-id") || req.get("x-debug-meta-correlation-id");
  if (!correlationId) {
    correlationId = uuid.v4();
    if (!isHealthOrMetricRequest(req)) {
      logger.info(`Didn't receive correlationId on path ${req.originalUrl}, created: ${correlationId}`, {
        meta: {correlationId: correlationId}
      });
    }
  }
  req.correlationId = correlationId;
  res.set("correlation-id", correlationId);
  return next();
}

function debugMeta(req, res, next) {
  req.debugMeta = {
    meta: {correlationId: req.correlationId}
  };

  return next();
}

module.exports = {
  correlationLog,
  debugMeta
};
