"use strict";

const client = require("prom-client");

const httpIncomingRequestsTotal = new client.Counter({
  name: "lu_http_incoming_requests_total",
  help: "Total number of incoming http requests.",
  labelNames: ["appName", "path", "bnNamespace"]
});
const httpIncomingRequestsInProgress = new client.Gauge({
  name: "lu_http_incoming_requests_in_progress",
  help: "Number of incoming requests currently processing.",
  labelNames: ["appName", "path", "bnNamespace"]
});
const httpIncomingRequestDurationSeconds = new client.Histogram({
  name: "lu_http_incoming_request_duration_seconds",
  help: "Duration of all incoming http requests.",
  labelNames: ["appName", "path", "bnNamespace"]
});

const httpIncomingRequestDurationSecondsTimer = (config) => {
  return httpIncomingRequestDurationSeconds.startTimer(config);
};

const httpIncomingRequestErrorsTotal = new client.Counter({
  name: "lu_http_incoming_request_errors_total",
  help: "Number of incoming requests that responds with error.",
  labelNames: ["appName", "statusCode", "path", "bnNamespace"]
});

module.exports = {
  httpIncomingRequestsTotal,
  httpIncomingRequestsInProgress,
  httpIncomingRequestDurationSeconds,
  httpIncomingRequestErrorsTotal,
  httpIncomingRequestDurationSecondsTimer
};
