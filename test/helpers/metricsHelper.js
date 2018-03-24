"use strict";

const prometheus = require("../../lib/prometheus");

function waitForMetricValue(counterName, label, value, callback) {
  const interval = setInterval(() => {
    const metric = prometheus.getSingleMetric(counterName);
    const metricLabel = metric.hashMap[label];
    if (metricLabel && metricLabel.value === value) {
      clearInterval(interval);
      return callback();
    }
  }, 10);
}

function getMetricValue(counterName, label = "") {
  const metric = prometheus.getSingleMetric(counterName);
  const metricLabel = metric.hashMap[label];
  return metricLabel ? metricLabel.value : 0;
}

function clear() {
  prometheus.clear();
}

module.exports = {
  clear,
  getMetricValue,
  waitForMetricValue
};
