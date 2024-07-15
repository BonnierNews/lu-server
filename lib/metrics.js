import { pushClient, cloudRunResourceProvider } from "@bonniernews/gcp-push-metrics";
import { logger } from "lu-logger";

const client = pushClient({ logger, resourceProvider: cloudRunResourceProvider });

const httpIncomingRequestsTotal = client.counter({
  name: "lu_http_incoming_requests_total",
  labels: {
    bnNamespace: [],
    appName: [],
    path: [],
  },
});

const httpIncomingRequestsInProgress = client.gauge({
  name: "lu_http_incoming_requests_in_progress",
  labels: {
    bnNamespace: [],
    appName: [],
    path: [],
  },
});

const httpIncomingRequestDurationSeconds = client.summary({
  name: "lu_http_incoming_request_duration_seconds",
  labels: {
    bnNamespace: [],
    appName: [],
    path: [],
  },
});

const httpIncomingRequestErrorsTotal = client.counter({
  name: "lu_http_incoming_request_errors_total",
  labels: {
    bnNamespace: [],
    appName: [],
    path: [],
    statusCode: [ "2xx", "3xx", "4xx", "5xx" ],
  },
});

export default {
  httpIncomingRequestsTotal,
  httpIncomingRequestsInProgress,
  httpIncomingRequestDurationSeconds,
  httpIncomingRequestErrorsTotal,
};
