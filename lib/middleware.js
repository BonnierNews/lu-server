import config from "exp-config";
import express from "express";
import { debugMeta, logger } from "lu-logger";

import isHealthOrMetricRequest from "./is-health-or-metric-request.js";
import { setCorrelationId, setDebugMeta } from "./log-middleware.js";
import requestMetrics from "./request-metrics.js";
import statusShutdown from "./status-middleware-when-shutting-down.js";

function hasData(obj) {
  return obj && Object.keys(obj).length;
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
      const meta = {
        ...req.debugMeta,
        ...(req.route && { route: req.route.path, methods: req.route.methods, statusCode: res?.statusCode }),
      };
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

export const router = express.Router(); // eslint-disable-line new-cap
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

export default router;
