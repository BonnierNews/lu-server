"use strict";

const {get} = require("../helpers/request-helper");

Feature("sigterm is received", () => {
  Scenario("_status should return 500", () => {
    When("We wait for SIGTERM", () => {
      process.emit("test-SIGTERM");
    });
    Then("Requesting /_status will return 500", async () => {
      await get("/_status").expect(500);
    });
    And("it should shutdown", (done) => {
      process.once("test-exit", () => {
        done();
      });
    });
  });
});
