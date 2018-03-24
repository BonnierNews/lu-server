"use strict";

const request = require("supertest");
const app = require("../../").app;

Feature("_alive", () => {
  Scenario("Basic alive check", () => {
    When("Requesting /_alive will return 200 Yes", (done) => {
      request(app)
        .get("/_alive")
        .expect(200)
        .expect("Yes")
        .end(done);
    });
  });
});
