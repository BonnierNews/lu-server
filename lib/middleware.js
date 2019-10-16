"use strict";

const express = require("express");
const config = require("exp-config");
const {logger} = require("lu-logger");
const {correlationLog, debugMeta} = require("./log-middleware");
const isHealthOrMetricRequest = require("./is-health-or-metric-request");
const requestMetrics = require("./request-metrics");
const statusShutdown = require("./status-middleware-when-shutting-down");

function accessLog(req, res, next) {
  const time = new Date();

  function afterResponse() {
    res.removeListener("finish", afterResponse);
    res.removeListener("close", afterResponse);

    if (!isHealthOrMetricRequest(req)) {
      if (!res.finished) {
        logger.debug(`"${req.method} ${req.originalUrl}" NO RESPONSE SENT ${new Date() - time} ms`, req.debugMeta);
      } else {
        logger.debug(`"${req.method} ${req.originalUrl}" ${res.statusCode} ${new Date() - time} ms`, req.debugMeta);
      }
    }
  }

  res.on("finish", afterResponse);
  res.on("close", afterResponse);

  next();
}

const router = express.Router(); // eslint-disable-line new-cap
router.use(correlationLog);
router.use(debugMeta);
router.use(requestMetrics);
if (config.requestLogging) {
  router.use(accessLog);
}
if (config.luServerShutdown) {
  router.use(statusShutdown);
  logger.info("inited statusShutdown middleware");
}

module.exports = router;
