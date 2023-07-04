"use strict";

const config = require("exp-config");

let metric;
if (config.livesIn === "GCP") {
  metric = require("./metrics-gcp");
} else {
  metric = require("./metrics-aws");
}

module.exports = {
  httpIncomingRequestsTotal: metric.httpIncomingRequestsTotal,
  httpIncomingRequestsInProgress: metric.httpIncomingRequestsInProgress,
  httpIncomingRequestDurationSeconds: metric.httpIncomingRequestDurationSeconds,
  httpIncomingRequestErrorsTotal: metric.httpIncomingRequestErrorsTotal
};
