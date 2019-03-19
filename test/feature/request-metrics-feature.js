"use strict";

const expect = require("chai").expect;
const prometeheus = require("../../lib/prometheus");
const {get} = require("../helpers/request-helper");

Feature("Incoming request metrics", () => {
  // eslint-disable-next-line no-undef
  beforeEachScenario(prometeheus.clear);

  Scenario("Request metrics should be registered", () => {
    let metricsRes;
    When("requesting the /metrics endpoint", async () => {
      metricsRes = await get("/metrics");
    });
    Then("the incoming request metrics should be registered", () => {
      const metrics = metricsRes.text.split("\n").reduce((acc, row) => {
        if (row.startsWith("# TYPE")) {
          const vals = row.split(" ");
          acc[vals[2]] = vals[3];
        }
        return acc;
      }, {});
      metrics.should.have.property("lu_http_incoming_requests_total", "counter");
      metrics.should.have.property("lu_http_incoming_requests_in_progress", "gauge");
      metrics.should.have.property("lu_http_incoming_request_duration_seconds", "histogram");
      metrics.should.have.property("lu_http_incoming_request_errors_total", "counter");
    });
  });

  Scenario("successfull request should generate metric", () => {
    let metricsRes;
    Given("a request is made to an epic endpoint", async () => {
      const router = require("../../lib/routes");
      router.get("/epic-endpoint", (req, res) => {
        res.sendStatus(200).json({});
      });
      await get("/epic-endpoint");
    });
    When("requesting the /metrics endpoint", async () => {
      metricsRes = await get("/metrics");
    });
    Then("the incoming request total counter should be incremented", () => {
      const totalCounter = getCounterMetric(metricsRes, "lu_http_incoming_request_duration_seconds");
      totalCounter.count.should.eql("1");
      totalCounter.labels.should.include("appName");
    });
    And("the incoming request duration counter should be incremented", () => {
      const totalCounter = getCounterMetric(metricsRes, "lu_http_incoming_request_duration_seconds");
      totalCounter.count.should.eql("1");
      totalCounter.labels.should.include("appName");
    });
  });

  Scenario("Failed request should generate metric", () => {
    let metricsRes;
    Given("a request is made to an not found endpoint", async () => {
      metricsRes = await get("/not-found");
    });
    When("requesting the /metrics endpoint", async () => {
      metricsRes = await get("/metrics");
    });
    Then("the incoming request error counter should be incremented", () => {
      const errorCounter = getCounterMetric(metricsRes, "lu_http_incoming_request_errors_total");
      errorCounter.count.should.eql("1");
      errorCounter.labels.should.include("404");
      errorCounter.labels.should.include("appName");
    });
  });

  Scenario("Ignored endpoints should not generate metrics", () => {
    let metricsRes;
    Given("a request is made to an ignored endpoint", async () => {
      metricsRes = await get("/_alive");
    });
    When("requesting the /metrics endpoint", async () => {
      metricsRes = await get("/metrics");
    });
    Then("the incoming request total counter should not be incremented", () => {
      const totalCounter = getCounterMetric(metricsRes, "lu_http_incoming_requests_total");
      expect(totalCounter).to.eql(undefined);
    });
  });
});

function getCounterMetric(metricsRes, metricName) {
  const metric = metricsRes.text.split("\n").find((row) => row.startsWith(metricName));
  if (!metric) return;
  const name = metric.substring(0, metric.indexOf("{"));
  const labels = metric.substring(metric.indexOf("{"), metric.indexOf("}") + 1);
  const count = metric.split(" ")[1];

  return {name, labels, count};
}
