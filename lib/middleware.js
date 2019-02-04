"use strict";

const express = require("express");
const config = require("exp-config");
const uuid = require("uuid");
const {logger} = require("lu-logger");

function isHealthOrMetricRequest(req) {
  return req.path.startsWith("/_") || req.path.startsWith("/metrics");
}

function accessLog(req, res, next) {
  const time = new Date();

  function afterResponse() {
    res.removeListener("finish", afterResponse);
    res.removeListener("close", afterResponse);

    const meta = {meta: {correlationId: req.correlationId}};

    if (!isHealthOrMetricRequest(req)) {
      if (!res.finished) {
        logger.debug(`"${req.method} ${req.originalUrl}" NO RESPONSE SENT ${new Date() - time} ms`, meta);
      } else {
        logger.debug(`"${req.method} ${req.originalUrl}" ${res.statusCode} ${new Date() - time} ms`, meta);
      }
    }
  }

  res.on("finish", afterResponse);
  res.on("close", afterResponse);

  next();
}

function correlationLog(req, res, next) {
  let correlationId = req.get("correlation-id");
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

const router = express.Router(); // eslint-disable-line new-cap
if (config.requestLogging) {
  router.use(accessLog);
}
router.use(correlationLog);

module.exports = router;
