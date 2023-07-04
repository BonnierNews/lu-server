"use strict";

const {pushClient, cloudRunResourceProvider} = require("@bonniernews/gcp-push-metrics");
const {logger} = require("lu-logger");

const client = pushClient({logger, resourceProvider: cloudRunResourceProvider});

const counters = {};

function httpIncomingRequestsTotal() {
  const key = "lu_http_incoming_requests_total";
  if (!counters[key]) {
    counters[key] = client.counter({
      name: key,
      labels: {
        bnNamespace: [],
        appName: [],
        path: []
      }
    });
  }

  return counters[key]();
}

function httpIncomingRequestsInProgress() {
  const key = "lu_http_incoming_requests_in_progress";
  if (!counters[key]) {
    counters[key] = client.gauge({
      name: key,
      labels: {
        bnNamespace: [],
        appName: [],
        path: []
      }
    });
  }

  return counters[key]();
}

function httpIncomingRequestDurationSeconds() {
  const key = "lu_http_incoming_request_duration_seconds";
  if (!counters[key]) {
    counters[key] = client.summary({
      name: key,
      labels: {
        bnNamespace: [],
        appName: [],
        path: []
      }
    });
  }
  logger.info("debug metrics", counters[key]);
  return counters[key]();
}

function httpIncomingRequestErrorsTotal() {
  const key = "lu_http_incoming_request_errors_total";
  if (!counters[key]) {
    counters[key] = client.counter({
      name: key,
      labels: {
        bnNamespace: [],
        appName: [],
        path: [],
        statusCode: ["2xx", "3xx", "4xx", "5xx"]
      }
    });
  }

  return counters[key]();
}

module.exports = {
  httpIncomingRequestsTotal,
  httpIncomingRequestsInProgress,
  httpIncomingRequestDurationSeconds,
  httpIncomingRequestErrorsTotal
};
