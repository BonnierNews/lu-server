"use strict";

const request = require("supertest");
const {app} = require("../helpers/app");
const expect = require("chai").expect;

Feature("App mounting", () => {
  Scenario("Mounting routes to an app", () => {
    Given("A router with some routes", () => {});
    When("Requesting and return status code will return 200 Yes", async () => {
      await request(app).get("/some-path").expect(200).expect("Yes");
    });
  });

  Scenario("Correlation id feature, no correlation id sent", () => {
    Given("A route", () => {});
    When("Requesting without correlation id shold return 200 Yes with a correlation id set", async () => {
      const res = await request(app).get("/some-path").expect(200).expect("Yes");
      expect(res.headers["correlation-id"]).to.have.length(36);
    });
  });

  Scenario("Correlation id feature, correlation id sent", () => {
    Given("A route", () => {});
    When("Requesting with a correlation id shold return 200 Yes with the correlation id set", async () => {
      const res = await request(app).get("/some-path").set("correlation-id", "foo").expect(200).expect("Yes");
      expect(res.headers["correlation-id"]).to.equal("foo");
    });
    When("Requesting with a x-correlation-id shold return 200 Yes with the correlation id set", async () => {
      const res = await request(app).get("/some-path").set("x-correlation-id", "foo").expect(200).expect("Yes");
      expect(res.headers["correlation-id"]).to.equal("foo");
    });
  });

  Scenario("Not found handling", () => {
    Given("A router with some routes", () => {});

    When("Requesting an unknown route will return 404 json", async () => {
      const res = await request(app).get("/unknown").expect(404).expect("Content-Type", /json/);
      const correlationId = res.headers["correlation-id"];
      res.body.should.eql({
        errors: [
          {
            status: "404",
            source: "/unknown",
            detail: "No resource GET /unknown",
            title: "Not Found"
          }
        ],
        meta: {correlationId}
      });
    });
  });

  Scenario("Error handling", () => {
    Given("A router with a routes that yields an error", () => {});

    let response;
    When("Requesting and internal error occures", async () => {
      response = await request(app).get("/error").expect(500).expect("Content-Type", /json/);
    });

    Then("we will get a generic error message", () => {
      const correlationId = response.headers["correlation-id"];
      expect(correlationId).to.have.length(36);
      response.body.should.eql({
        errors: [
          {
            status: "500",
            title: "Server Error",
            detail: "GET /error: Error: Foo",
            source: "/error"
          }
        ],
        meta: {
          correlationId
        }
      });
    });
  });

  Scenario("Error handling after timeout", () => {
    Given("A router with a routes that yields an error after timeout", () => {});
    When("Requesting an unknown route will return 500 json", (done) => {
      request(app)
        .get("/timeouterror")
        .timeout(1)
        .end((err) => {
          if (err) return done();
          return done(new Error("Should have died with a timeout error"));
        });
    });
  });
});
