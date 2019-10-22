"use strict";

const prometheusClient = require("prom-client");
prometheusClient.collectDefaultMetrics();

const register = prometheusClient.register;
const counters = [];
const gauges = [];

function addCounter(name, help) {
  const newCounter = new prometheusClient.Counter({
    name: name,
    help: help || "Counter"
  });

  counters.push(newCounter);
  return newCounter;
}

function addGauge(name, help) {
  const newGauge = new prometheusClient.Gauge({
    name: name,
    help: help || "Gauge"
  });

  gauges.push(newGauge);
  return newGauge;
}

function getSingleMetric(name) {
  return register.getSingleMetric(name);
}

function getMetrics() {
  return register.metrics();
}

function clear() {
  register.resetMetrics();
  for (const counter of counters) {
    counter.reset();
  }
  for (const gauge of gauges) {
    gauge.reset();
  }
}

module.exports = {
  contentType: register.contentType,
  addCounter,
  addGauge,
  getMetrics,
  getSingleMetric,
  clear
};
