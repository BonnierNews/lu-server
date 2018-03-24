"use strict";

const requestHelper = require("../helpers/requestHelper");

Feature("_status", () => {
  Scenario("Basic status check", () => {

    When("Requesting /_status will return 200 Yes", (done) => {
      requestHelper.get("/_status", (response) => {
        response.statusCode.should.eql(200);
      }, done);
    });
  });
});
