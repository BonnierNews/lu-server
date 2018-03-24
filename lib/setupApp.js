"use strict";

const express = require("express");
const errorHandler = require("./errorHandler");
const middleware = require("./middleware.js");
const routes = require("./routes.js");
const config = require("exp-config");
const http = require("http");
const https = require("https");
const bodyParser = require("body-parser");

function setupApp(callback) {
  const app = express();

  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(bodyParser.text({
    type: "text/*"
  }));
  app.use(bodyParser.json());

  // Don't limit the number of outgoing HTTP requests (defaults to 4 simultaneous requests)
  http.globalAgent.maxSockets = Infinity;
  https.globalAgent.maxSockets = Infinity;

  // Make sure dates are displayed in the correct timezone
  process.env.TZ = "Europe/Stockholm";

  middleware(app);
  routes(app);

  app.use(errorHandler);

  return app;
}

module.exports = setupApp;
