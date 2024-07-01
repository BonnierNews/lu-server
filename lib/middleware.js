"use strict";

const express = require("express");
const config = require("exp-config");
const { setCorrelationId, setDebugMeta } = require("./log-middleware");
const { logger, debugMeta } = require("lu-logger");
const isHealthOrMetricRequest = require("./is-health-or-metric-request");
const requestMetrics = require("./request-metrics");
const statusShutdown = require("./status-middleware-when-shutting-down");

function hasData(obj) {
  return Object.keys(obj).length;
}

function accessLog(req, res, next) {
  const time = new Date();

  if (!isHealthOrMetricRequest(req)) {
    const usefulStuff = [];
    if (hasData(req.body)) usefulStuff.push(`body: ${JSON.stringify(req.body)}`);
    if (hasData(req.query)) usefulStuff.push(`query: ${JSON.stringify(req.query)}`);
    const inputs = usefulStuff.length ? ` with ${usefulStuff.join(", ")}` : "";
    logger.info(`${req.method} received on ${req.url}${inputs}`);
  }

  function afterResponse() {
    res.removeListener("finish", afterResponse);
    res.removeListener("close", afterResponse);

    if (!isHealthOrMetricRequest(req)) {
      const meta = { ...req.debugMeta, ...(req.route && { route: req.route.path, methods: req.route.methods }) };
      if (!res.finished) {
        logger.info(`"${req.method} ${req.originalUrl}" NO RESPONSE SENT ${new Date() - time} ms`, meta);
      } else {
        logger.info(`"${req.method} ${req.originalUrl}" ${res.statusCode} ${new Date() - time} ms`, meta);
      }
    }
  }

  res.on("finish", afterResponse);
  res.on("close", afterResponse);

  next();
}

const router = express.Router(); // eslint-disable-line new-cap
router.use(setCorrelationId);
router.use(setDebugMeta);
router.use(debugMeta.initMiddleware((req) => req.debugMeta));
router.use(requestMetrics);
if (config.requestLogging) {
  router.use(accessLog);
}
if (config.luServerShutdown) {
  router.use(statusShutdown);
  logger.info("inited statusShutdown middleware");
}

module.exports = router;
