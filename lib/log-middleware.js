import camelcase from "camelcase";
import config from "exp-config";
import { logger } from "lu-logger";
import * as uuid from "uuid";

import isHealthOrMetricRequest from "./is-health-or-metric-request.js";

const debugPrefix = "x-debug-meta";

export function setCorrelationId(req, res, next) {
  let correlationId =
    req.get("correlation-id") || req.get("x-correlation-id") || req.get(`${debugPrefix}-correlation-id`) || req.body.meta?.correlationId;
  if (!correlationId) {
    correlationId = uuid.v4();
    if (!isHealthOrMetricRequest(req)) {
      logger.debug(`Didn't receive correlationId on path ${req.originalUrl}, created: ${correlationId}`, { correlationId });
    }
  }
  req.correlationId = correlationId;
  res.set("correlation-id", correlationId);
  return next();
}

export function setDebugMeta(req, res, next) {
  const meta = { correlationId: req.correlationId };
  for (const header of Object.keys(req.headers)) {
    if (header.startsWith(debugPrefix) && header !== `${debugPrefix}-correlation-id`) {
      meta[debugKey(header)] = req.headers[header];
    }
    if (config.logClientIp) {
      meta.clientIp = req.ip;
      meta.trueClientIp = req.headers["True-Client-IP"] || req.headers["true-client-ip"];
    }
  }

  const clientServiceAccount = req.headers["x-goog-authenticated-user-email"];
  if (clientServiceAccount) {
    meta.clientServiceAccount = clientServiceAccount;
  }

  req.debugMeta = meta;
  return next();
}

const prefixRegExp = new RegExp(`^${debugPrefix}-`);
function debugKey(header) {
  return camelcase(header.replace(prefixRegExp, ""));
}

export default { setCorrelationId, setDebugMeta };
