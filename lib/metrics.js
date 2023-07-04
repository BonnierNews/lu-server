"use strict";

const config = require("exp-config");
const metricsAws = require("./metrics-aws");
const metricsGcp = require("./metrics-gcp");

const metric = config.livesIn === "GCP" ? metricsGcp : metricsAws;

module.exports = {
  httpIncomingRequestsTotal: metric.httpIncomingRequestsTotal,
  httpIncomingRequestsInProgress: metric.httpIncomingRequestsInProgress,
  httpIncomingRequestDurationSeconds: metric.httpIncomingRequestDurationSeconds,
  httpIncomingRequestErrorsTotal: metric.httpIncomingRequestErrorsTotal
};
