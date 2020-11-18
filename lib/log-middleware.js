"use strict";
const uuid = require("uuid");
const config = require("exp-config");
const isHealthOrMetricRequest = require("./is-health-or-metric-request");
const {logger} = require("lu-logger");
const debugPrefix = "x-debug-meta";
const camelcase = require("camelcase");

function correlationLog(req, res, next) {
  let correlationId =
    req.get("correlation-id") || req.get("x-correlation-id") || req.get(`${debugPrefix}-correlation-id`);
  if (!correlationId) {
    correlationId = uuid.v4();
    if (!isHealthOrMetricRequest(req)) {
      logger.debug(`Didn't receive correlationId on path ${req.originalUrl}, created: ${correlationId}`, {
        meta: {correlationId: correlationId}
      });
    }
  }
  req.correlationId = correlationId;
  res.set("correlation-id", correlationId);
  return next();
}

function debugMeta(req, res, next) {
  const meta = {correlationId: req.correlationId};
  for (const header of Object.keys(req.headers)) {
    if (header.startsWith(debugPrefix) && header !== `${debugPrefix}-correlation-id`) {
      meta[debugKey(header)] = req.headers[header];
    }
    if (config.logClientIp) {
      meta.clientIp = req.ip;
      meta.trueClientIp = req.headers["True-Client-IP"] || req.headers["true-client-ip"];
    }
  }
  req.debugMeta = meta;
  return next();
}

const prefixRegExp = new RegExp(`^${debugPrefix}-`);
function debugKey(header) {
  return camelcase(header.replace(prefixRegExp, ""));
}

module.exports = {
  correlationLog,
  debugMeta
};
