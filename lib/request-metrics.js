"use strict";

const metrics = require("./metrics");
const statusCodeRegex = /^[^2-3]/g;
const callingAppName = require(`${process.cwd()}/package.json`).name;

module.exports = requestMetrics;

const ignoredPaths = ["_alive", "_status", "metrics"];

function requestMetrics(req, res, next) {
  if (ignored(req.path)) return next();

  const appName = getAppName();

  const observeRequestDuration = metrics.httpIncomingRequestDurationSeconds.startTimer({appName});
  metrics.httpIncomingRequestsTotal.inc({appName});
  metrics.httpIncomingRequestsInProgress.inc({appName});

  let alreadyReported = false;

  const report = (requestFailed) => {
    if (alreadyReported) return;

    observeRequestDuration({appName});
    metrics.httpIncomingRequestsInProgress.dec({appName});

    if (requestFailed) {
      metrics.httpIncomingRequestErrorsTotal.inc({appName, statusCode: res.statusCode});
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
