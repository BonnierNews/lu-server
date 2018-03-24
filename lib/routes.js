"use strict";

const alive = require("./routes/alive.js");
const status = require("./routes/status.js");
const prometheus = require("./routes/prometheus");

module.exports = function routes(app) {

  app.get("/_alive", alive);
  app.head("/_alive", alive);

  app.get("/_status", status);
  app.head("/_status", status);

  // prometheus
  app.get("/metrics/", prometheus.metrics);
};
