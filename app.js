"use strict";

const express = require("express");
const http = require("http");
const https = require("https");
const bodyParser = require("body-parser");
const middleware = require("./lib/middleware.js");
const routes = require("./lib/routes.js");
const config = require("exp-config");
const bugsnag = require("bugsnag");

if (config.bugsnagApiKey) {
  bugsnag.register(config.bugsnagApiKey);
}

function init() {
  const app = express();

  if (config.bugsnagApiKey) {
    app.use(bugsnag.requestHandler);
  }

  app.disable("x-powered-by");
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.text({type: "text/*"}));
  app.use(bodyParser.json());

  // Don't limit the number of outgoing HTTP requests (defaults to 4 simultaneous requests)
  http.globalAgent.maxSockets = Infinity;
  https.globalAgent.maxSockets = Infinity;

  process.env.TZ = "Europe/Stockholm";

  app.use(middleware);
  app.use(routes);

  return app;
}

module.exports = init;
