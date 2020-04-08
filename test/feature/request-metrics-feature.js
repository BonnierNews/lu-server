"use strict";

const config = require("exp-config");
const expect = require("chai").expect;
const prometeheus = require("../../lib/prometheus");
const {get, post} = require("../helpers/request-helper");
const router = require("../../lib/routes");

Feature("Incoming request metrics", () => {
  before(() => {
    router.get("/epic-endpoint", (req, res) => {
      return res.status(200).json({});
    });
    router.post("/epic-endpoint", (req, res) => {
      return res.status(200).json({});
    });
  });
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
      await get("/epic-endpoint");
    });
    When("requesting the /metrics endpoint", async () => {
      metricsRes = await get("/metrics");
    });
    Then("the incoming request total counter should be incremented", () => {
      const totalCounter = getCounterMetric(metricsRes, "lu_http_incoming_requests_total");
      totalCounter.count.should.eql("1");
      totalCounter.labels.should.include("appName");
      totalCounter.labels.should.include("path");
      totalCounter.labels.should.include("omitted");
    });
    And("the incoming request duration counter should be incremented", () => {
      const durationCounter = getCounterMetric(metricsRes, "lu_http_incoming_request_duration_seconds");
      durationCounter.count.should.eql("1");
      durationCounter.labels.should.include("appName");
      durationCounter.labels.should.include("path");
      durationCounter.labels.should.include("omitted");
      durationCounter.labels.should.include("bnNamespace");
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
      errorCounter.labels.should.include("path");
      errorCounter.labels.should.include("bnNamespace");
    });
  });

  Scenario("successfull request with enableReqMetricPathLabel true should generate metric with path label", () => {
    before(() => {
      process.env.ALLOW_TEST_ENV_OVERRIDE = true;
      config.enableReqMetricPathLabel = true;
    });
    after(() => {
      config.enableReqMetricPathLabel = false;
      process.env.ALLOW_TEST_ENV_OVERRIDE = false;
    });
    let metricsRes;
    Given("a request is made to an epic endpoint", async () => {
      await get("/epic-endpoint");
    });
    When("requesting the /metrics endpoint", async () => {
      metricsRes = await get("/metrics");
    });
    Then("the incoming request total counter should be incremented", () => {
      const totalCounter = getCounterMetric(metricsRes, "lu_http_incoming_requests_total");
      totalCounter.count.should.eql("1");
      totalCounter.labels.should.include("appName");
      totalCounter.labels.should.include("path");
      totalCounter.labels.should.include("/epic-endpoint");
    });
    And("the incoming request duration counter should be incremented", () => {
      const durationCounter = getCounterMetric(metricsRes, "lu_http_incoming_request_duration_seconds");
      durationCounter.count.should.eql("1");
      durationCounter.labels.should.include("appName");
      durationCounter.labels.should.include("path");
      durationCounter.labels.should.include("/epic-endpoint");
    });
  });

  Scenario("Failed request with enableReqMetricPathLabel true should generate metric with path label", () => {
    before(() => {
      process.env.ALLOW_TEST_ENV_OVERRIDE = true;
      config.enableReqMetricPathLabel = true;
    });
    after(() => {
      config.enableReqMetricPathLabel = false;
      process.env.ALLOW_TEST_ENV_OVERRIDE = false;
    });
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
      errorCounter.labels.should.include("path");
      errorCounter.labels.should.include("/not-found");
    });
  });

  Scenario(
    "successfull request (with userId) with enableReqMetricNamespaceLabel true should generate metric with bnNamespace label",
    () => {
      before(() => {
        process.env.ALLOW_TEST_ENV_OVERRIDE = true;
        config.enableReqMetricNamespaceLabel = true;
      });
      after(() => {
        config.enableReqMetricNamespaceLabel = false;
        process.env.ALLOW_TEST_ENV_OVERRIDE = false;
      });
      let metricsRes;
      Given("a request is made to an epic endpoint with userId", async () => {
        await post("/epic-endpoint", {userId: "expressen://user-guid"});
      });
      When("requesting the /metrics endpoint", async () => {
        metricsRes = await get("/metrics");
      });
      Then("the incoming request total counter should be incremented", () => {
        const totalCounter = getCounterMetric(metricsRes, "lu_http_incoming_requests_total");
        totalCounter.count.should.eql("1");
        totalCounter.labels.should.include("appName");
        totalCounter.labels.should.include("bnNamespace");
        totalCounter.labels.should.include("expressen");
      });
      And("the incoming request duration counter should be incremented", () => {
        const durationCounter = getCounterMetric(metricsRes, "lu_http_incoming_request_duration_seconds");
        durationCounter.count.should.eql("1");
        durationCounter.labels.should.include("appName");
        durationCounter.labels.should.include("bnNamespace");
        durationCounter.labels.should.include("expressen");
      });
    }
  );

  Scenario(
    "successfull request (with bad userId) with enableReqMetricNamespaceLabel true should generate metric with bnNamespace label",
    () => {
      before(() => {
        process.env.ALLOW_TEST_ENV_OVERRIDE = true;
        config.enableReqMetricNamespaceLabel = true;
      });
      after(() => {
        config.enableReqMetricNamespaceLabel = false;
        process.env.ALLOW_TEST_ENV_OVERRIDE = false;
      });
      let metricsRes;
      Given("a request is made to an epic endpoint with userId", async () => {
        await post("/epic-endpoint", {userId: "user-guid"});
      });
      When("requesting the /metrics endpoint", async () => {
        metricsRes = await get("/metrics");
      });
      Then("the incoming request total counter should be incremented", () => {
        const totalCounter = getCounterMetric(metricsRes, "lu_http_incoming_requests_total");
        totalCounter.count.should.eql("1");
        totalCounter.labels.should.include("appName");
        totalCounter.labels.should.include('bnNamespace="omitted"');
      });
      And("the incoming request duration counter should be incremented", () => {
        const durationCounter = getCounterMetric(metricsRes, "lu_http_incoming_request_duration_seconds");
        durationCounter.count.should.eql("1");
        durationCounter.labels.should.include("appName");
        durationCounter.labels.should.include('bnNamespace="omitted"');
      });
    }
  );

  Scenario(
    "successfull request (with bad userId number) with enableReqMetricNamespaceLabel true should generate metric with bnNamespace label",
    () => {
      before(() => {
        process.env.ALLOW_TEST_ENV_OVERRIDE = true;
        config.enableReqMetricNamespaceLabel = true;
      });
      after(() => {
        config.enableReqMetricNamespaceLabel = false;
        process.env.ALLOW_TEST_ENV_OVERRIDE = false;
      });
      let metricsRes;
      Given("a request is made to an epic endpoint with userId", async () => {
        await post("/epic-endpoint", {userId: 123456});
      });
      When("requesting the /metrics endpoint", async () => {
        metricsRes = await get("/metrics");
      });
      Then("the incoming request total counter should be incremented", () => {
        const totalCounter = getCounterMetric(metricsRes, "lu_http_incoming_requests_total");
        totalCounter.count.should.eql("1");
        totalCounter.labels.should.include("appName");
        totalCounter.labels.should.include('bnNamespace="omitted"');
      });
      And("the incoming request duration counter should be incremented", () => {
        const durationCounter = getCounterMetric(metricsRes, "lu_http_incoming_request_duration_seconds");
        durationCounter.count.should.eql("1");
        durationCounter.labels.should.include("appName");
        durationCounter.labels.should.include('bnNamespace="omitted"');
      });
    }
  );

  Scenario(
    "successfull request (with namespace) with enableReqMetricNamespaceLabel true should generate metric with bnNamespace label",
    () => {
      before(() => {
        process.env.ALLOW_TEST_ENV_OVERRIDE = true;
        config.enableReqMetricNamespaceLabel = true;
      });
      after(() => {
        config.enableReqMetricNamespaceLabel = false;
        process.env.ALLOW_TEST_ENV_OVERRIDE = false;
      });
      let metricsRes;
      Given("a request is made to an epic endpoint with userId", async () => {
        await post("/epic-endpoint", {namespace: "expressen"});
      });
      When("requesting the /metrics endpoint", async () => {
        metricsRes = await get("/metrics");
      });
      Then("the incoming request total counter should be incremented", () => {
        const totalCounter = getCounterMetric(metricsRes, "lu_http_incoming_requests_total");
        totalCounter.count.should.eql("1");
        totalCounter.labels.should.include("appName");
        totalCounter.labels.should.include("bnNamespace");
        totalCounter.labels.should.include("expressen");
      });
      And("the incoming request duration counter should be incremented", () => {
        const durationCounter = getCounterMetric(metricsRes, "lu_http_incoming_request_duration_seconds");
        durationCounter.count.should.eql("1");
        durationCounter.labels.should.include("appName");
        durationCounter.labels.should.include("bnNamespace");
        durationCounter.labels.should.include("expressen");
      });
    }
  );

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
