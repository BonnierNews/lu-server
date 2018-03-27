"use strict";

const config = require("exp-config");
const bugsnag = require("bugsnag");
const notFoundHandler = require("./lib/notFoundHandler");
const errorHandler = require("./lib/errorHandler");

function buildApp(routes) {
  const app = require("./app")();
  if (routes) {
    app.use(routes);
  }
  app.use(notFoundHandler);
  app.use(errorHandler);
  if (config.bugsnagApiKey) {
    app.use(bugsnag.errorHandler);
  }

  return app;
}

module.exports = {
  buildApp,
  prometheus: require("./lib/prometheus")
};
