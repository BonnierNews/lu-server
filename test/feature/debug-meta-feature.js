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
      const response = await request(app).get("/some-path").expect(200);
      expect(response.headers["correlation-id"]).to.have.length(36);
      correlationId = response.headers["correlation-id"];
    });

    Then("A correlation id should be set in debugMeta", () => {
      const {req} = requests.pop();
      req.correlationId.should.eql(correlationId);
      req.debugMeta.correlationId.should.eql(correlationId);
    });
  });

  Scenario("Correlation id is set", () => {
    before(reset);
    Given("The debugMiddlware is attached", () => {});

    When("Requesting with correlation id", async () => {
      const response = await request(app).get("/some-path").set("correlation-id", "some-corr-id").expect(200);
      expect(response.headers["correlation-id"]).to.equal("some-corr-id");
    });

    Then("A correlation id should be set in debugMeta", () => {
      const {req} = requests.pop();
      req.correlationId.should.equal("some-corr-id");
      req.debugMeta.correlationId.should.equal("some-corr-id");
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
      req.debugMeta.correlationId.should.equal("some-corr-id");
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
      req.debugMeta.correlationId.should.equal("corr-1");
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
      req.debugMeta.correlationId.should.equal("corr-2");
    });
  });

  Scenario("Debug meta is set", () => {
    let response;
    before(reset);
    Given("the debugMiddlware is attached", () => {});

    When("requesting with x-debug-meta-anything header", async () => {
      response = await request(app)
        .get("/some-path")
        .set("correlation-id", "9208d5d6-1182-4a96-b86e-4209904a6648")
        .set("x-debug-meta-anything", "something")
        .set("z-x-debug-meta-anything2", "otherthing")
        .expect(200);
    });

    Then("a correlation id should be set in debugMeta", () => {
      expect(response.headers["correlation-id"]).to.equal("9208d5d6-1182-4a96-b86e-4209904a6648");
      const {req} = requests[0];
      req.correlationId.should.equal("9208d5d6-1182-4a96-b86e-4209904a6648");
      req.debugMeta.correlationId.should.equal("9208d5d6-1182-4a96-b86e-4209904a6648");
    });

    And("the 'anything' should be set in 'debugMeta'", () => {
      const {req} = requests[0];
      req.debugMeta.should.have.property("anything", "something");
    });

    And("the 'clientIp' should be set in 'debugMeta'", () => {
      const {req} = requests[0];
      req.debugMeta.should.have.property("clientIp");
    });

    But("Nothing more than anything, correlationId and clientIp", () => {
      const {req} = requests[0];
      Object.keys(req.debugMeta).should.have.length(4);
      req.debugMeta.should.not.have.property("anything2");
    });
  });

  Scenario("Debug meta is set with to camelcase version of variable", () => {
    before(reset);
    Given("the debugMiddlware is attached", () => {});

    When("requesting with x-debug-meta-anything header", async () => {
      await request(app).get("/some-path").set("x-debug-meta-an-epic-variable", "a-value").expect(200);
    });

    Then("the 'a-value' should be set in 'debugMeta' as 'anEpicVariable'", () => {
      const {req} = requests[0];
      req.debugMeta.should.have.property("anEpicVariable", "a-value");
    });
  });

  Scenario("clientIp and trueClientIp should be set in debugMeta", () => {
    before(reset);
    Given("the debugMiddlware is attached", () => {});

    When("requesting with True-Client-IP header", async () => {
      await request(app).get("/some-path").set("True-Client-IP", "0.1.2.3").expect(200);
    });

    Then("the clientIp and trueClientIp should be set in 'debugMeta'", () => {
      const {req} = requests[0];
      req.debugMeta.should.have.property("clientIp");
      req.debugMeta.should.have.property("trueClientIp", "0.1.2.3");
    });
  });
});
