"use strict";

const prometheusClient = require("prom-client");
prometheusClient.collectDefaultMetrics();

const register = prometheusClient.register;
const counters = [];

function addCounter(name, help) {
  const newCounter = new prometheusClient.Counter({
    name: name,
    help: help || "Counter"
  });

  counters.push(newCounter);
  return newCounter;
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
}

module.exports = {
  contentType: register.contentType,
  addCounter,
  getMetrics,
  getSingleMetric,
  clear
};
