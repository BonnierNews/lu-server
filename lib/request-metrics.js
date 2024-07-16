import config from "exp-config";
import fs from "fs";
import { join } from "path";

import metrics from "./metrics.js";

const callingAppName = JSON.parse(fs.readFileSync(join(process.cwd(), "package.json"))).name;

const statusCodeRegex = /^[^2-3]/g;

const ignoredPaths = [ "_alive", "_status", "metrics" ];

export default function requestMetrics(req, res, next) {
  if (ignored(req.path)) return next();

  const appName = getAppName();
  const path = getPath(req);
  const namespace = getNamespace(req);

  const observeRequestDuration = metrics.httpIncomingRequestDurationSeconds.startTimer({
    appName,
    path,
    bnNamespace: namespace,
  });
  metrics.httpIncomingRequestsTotal.inc({ appName, path, bnNamespace: namespace });
  metrics.httpIncomingRequestsInProgress.inc({ appName, path, bnNamespace: namespace });

  let alreadyReported = false;

  const report = (requestFailed) => {
    if (alreadyReported) return;
    observeRequestDuration({ appName, path, bnNamespace: namespace });
    metrics.httpIncomingRequestsInProgress.dec({ appName, path, bnNamespace: namespace });

    if (requestFailed) {
      metrics.httpIncomingRequestErrorsTotal.inc({ appName, statusCode: res.statusCode, path, bnNamespace: namespace });
    }

    alreadyReported = true;
  };

  res.on("close", () => {
    // this would indicate an error
    report(true);
  });

  res.on("finish", () => {
    const requestFailed = statusCodeRegex.test(res.statusCode.toString());
    report(requestFailed);
  });

  next();
}

function ignored(reqPath) {
  const reqPathFirstPart = reqPath.split("/")[1];
  if (ignoredPaths.some((path) => reqPathFirstPart === path)) {
    return true;
  }
  return false;
}

function getAppName() {
  return callingAppName && callingAppName.replace(/^@[^/]*\//, "").replace(/-/g, "");
}

function getPath(req) {
  if (!config.enableReqMetricPathLabel) return "omitted"; // NOTE this should not be enabled if you have params in your routes
  return req.path;
}

function getNamespace(req) {
  if (!config.enableReqMetricNamespaceLabel) return "omitted"; // NOTE this should only be enabled for lu-premium public apis
  if (req.body && req.body.userId && typeof req.body.userId === "string") {
    if (!req.body.userId.includes("://")) return "omitted";
    const [ namespace ] = req.body.userId.split("://");
    return namespace || "omitted";
  }
  if (req.body && req.body.namespace) {
    return req.body.namespace;
  }
  return "omitted";
}
