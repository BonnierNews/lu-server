"use strict";

const metric = require("./metrics-gcp");

module.exports = {
  httpIncomingRequestsTotal: metric.httpIncomingRequestsTotal,
  httpIncomingRequestsInProgress: metric.httpIncomingRequestsInProgress,
  httpIncomingRequestDurationSeconds: metric.httpIncomingRequestDurationSeconds,
  httpIncomingRequestErrorsTotal: metric.httpIncomingRequestErrorsTotal,
};
