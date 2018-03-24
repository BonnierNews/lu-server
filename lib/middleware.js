"use strict";

const express = require("express");
const config = require("exp-config");
const uuid = require("uuid");
const logger = require("lu-logger")(config.logging);

function isHealthOrMetricRequest(req) {
  return req.path.startsWith("/_") || req.path.startsWith("/metrics");
}

function accessLog(req, res, next) {
  const time = new Date();

  function afterResponse() {
    res.removeListener("finish", afterResponse);
    res.removeListener("close", afterResponse);

    if (!isHealthOrMetricRequest(req)) {
      logger.debug(`"${req.method} ${req.path}" ${res.statusCode} ${new Date() - time} ms`, {meta: {correlationId: req.correlationId}});
    }
  }

  res.on("finish", afterResponse);
  res.on("close", afterResponse);

  next();
}

function correlationLog(req, res, next) {
  if (isHealthOrMetricRequest(req)) {
    return next();
  }
  let correlationId = req.get("correlation-id");
  if (!correlationId) {
    correlationId = uuid.v4();
    logger.info(`Didn't receive correlationId on path ${req.path}, created: ${correlationId}`, { meta: { correlationId: correlationId } });
  }
  req.correlationId = correlationId;
  res.set("correlation-id", correlationId);
  return next();
}

const router = express.Router(); // eslint-disable-line new-cap
if (config.requestLogging) {
  router.use(accessLog);
}
router.use(correlationLog);

module.exports = router;
