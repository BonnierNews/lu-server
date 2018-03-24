"use strict";

const notFoundHandler = require("./lib/notFoundHandler");
const errorHandler = require("./lib/errorHandler");

function buildApp(routes) {
  const app = require("./app")();
  if (routes) {
    app.use(routes);
  }
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

module.exports = {
  buildApp,
  prometheus: require("./lib/prometheus")
};
