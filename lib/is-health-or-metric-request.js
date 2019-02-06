"use strict";

function isHealthOrMetricRequest(req) {
  return req.path.startsWith("/_") || req.path.startsWith("/metrics");
}

module.exports = isHealthOrMetricRequest;
