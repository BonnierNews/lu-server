"use strict";

const request = require("supertest");
const {app, requests, reset} = require("../helpers/app");
const expect = require("chai").expect;

Feature("Debug meta attached to requests", () => {
  Scenario("No debugMeta is sent", () => {
    before(reset);
    Given("The debugMiddlware is attached", () => {});

    let correlationId;
    When("Requesting without correlation id", async () => {
      const response = await request(app)
        .get("/some-path")
        .expect(200);
      expect(response.headers["correlation-id"]).to.have.length(36);
      correlationId = response.headers["correlation-id"];
    });

    Then("A correlation id should be set in debugMeta", () => {
      const {req} = requests.pop();
      req.correlationId.should.eql(correlationId);
      req.debugMeta.meta.correlationId.should.eql(correlationId);
    });
  });

  Scenario("Correlation id is set", () => {
    before(reset);
    Given("The debugMiddlware is attached", () => {});

    When("Requesting with correlation id", async () => {
      const response = await request(app)
        .get("/some-path")
        .set("correlation-id", "some-corr-id")
        .expect(200);
      expect(response.headers["correlation-id"]).to.equal("some-corr-id");
    });

    Then("A correlation id should be set in debugMeta", () => {
      const {req} = requests.pop();
      req.correlationId.should.equal("some-corr-id");
      req.debugMeta.meta.correlationId.should.equal("some-corr-id");
    });
  });

  Scenario("DebugMeta is set", () => {
    before(reset);
    Given("The debugMiddlware is attached", () => {});

    When("Requesting with correlation id", async () => {
      const response = await request(app)
        .get("/some-path")
        .set("x-debug-meta-correlation-id", "some-corr-id")
        .expect(200);
      expect(response.headers["correlation-id"]).to.equal("some-corr-id");
    });

    Then("A correlation id should be set in debugMeta", () => {
      const {req} = requests.pop();
      req.correlationId.should.equal("some-corr-id");
      req.debugMeta.meta.correlationId.should.equal("some-corr-id");
    });
  });

  Scenario("Multiple correlation id are set", () => {
    let response;
    before(reset);
    Given("The debugMiddlware is attached", () => {});

    When("Requesting with correlation-id header", async () => {
      response = await request(app)
        .get("/some-path")
        .set("correlation-id", "corr-1")
        .set("x-correlation-id", "corr-2")
        .set("x-debug-meta-correlation-id", "corr-3")
        .expect(200);
    });

    Then("A correlation id should be set in debugMeta", () => {
      expect(response.headers["correlation-id"]).to.equal("corr-1");
      const {req} = requests.pop();
      req.correlationId.should.equal("corr-1");
      req.debugMeta.meta.correlationId.should.equal("corr-1");
    });

    When("Requesting with x-correlation-id header", async () => {
      response = await request(app)
        .get("/some-path")
        .set("x-correlation-id", "corr-2")
        .set("x-debug-meta-correlation-id", "corr-3")
        .expect(200);
    });

    Then("A correlation id should be set in debugMeta", () => {
      expect(response.headers["correlation-id"]).to.equal("corr-2");
      const {req} = requests.pop();
      req.correlationId.should.equal("corr-2");
      req.debugMeta.meta.correlationId.should.equal("corr-2");
    });
  });

});
