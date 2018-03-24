"use strict";

const prometheus = require("../prometheus");

function metrics(req, res) {
  res.set("Content-Type", prometheus.contentType);

  res.end(`${prometheus.getMetrics()}\n`);
}

module.exports = {
  metrics
};
