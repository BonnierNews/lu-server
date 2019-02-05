"use strict";

const request = require("supertest");
const {app} = require("../helpers/app");
const expect = require("chai").expect;

Feature("Error handling", () => {
  Scenario("Correlation id feature, no correlation id sent", () => {
    Given("A route", () => {});
    When("Requesting without correlation id shold return 200 Yes with a correlation id set", (done) => {
      request(app)
        .get("/bork")
        .expect(500)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.headers["correlation-id"]).to.have.length(36);
          done();
        });
    });
  });

  Scenario("Correlation id feature, correlation id sent", () => {
    Given("A route", () => {});
    When("Requesting with a correlation id shold return 200 Yes with the correlation id set", (done) => {
      request(app)
        .get("/bork")
        .set("correlation-id", "foo")
        .expect(500)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.headers["correlation-id"]).to.equal("foo");
          expect(res.body.meta.correlationId.should.eql("foo"));
          done();
        });
    });
  });
});
