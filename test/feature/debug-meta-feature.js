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
      const {req, res} = requests.pop();
      req.correlationId.should.eql(correlationId);
      req.debugMeta.meta.correlationId.should.eql(correlationId);
    });
  });

  Scenario("DebugMeta is sent", () => {
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
      const {req, res} = requests.pop();
      req.correlationId.should.equal("some-corr-id");
      req.debugMeta.meta.correlationId.should.equal("some-corr-id");
    });
  });

});
