"use strict";

const config = require("exp-config");
const bugsnag = require("bugsnag");
const notFoundHandler = require("./lib/notFoundHandler");
const errorHandler = require("./lib/errorHandler");
const shutdownHandler = require("./lib/shutdownHandler");
const sigtermHandler = require("./lib/handle-sigterm");

function buildApp(routes) {
  const app = require("./app")();
  if (routes) {
    app.use(routes);
  }

  if (config.logClientIp) app.enable("trust proxy");

  app.use(notFoundHandler);
  // Bugsnag should be the first error handler
  if (config.bugsnagApiKey) {
    app.use(bugsnag.errorHandler);
  }
  app.use(errorHandler);

  return app;
}

module.exports = {
  buildApp,
  prometheus: require("./lib/prometheus"),
  shutdownHandler,
  sigtermHandler,
  errorHelper: require("./lib/render-error"),
  validator: require("./lib/validator")
};
