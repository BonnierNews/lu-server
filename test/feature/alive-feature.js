"use strict";

const { get } = require("../helpers/request-helper");

Feature("_alive", () => {
  Scenario("Basic alive check", () => {
    When("Requesting /_alive will return 200 Yes", async () => {
      await get("/_alive").expect(200).expect("Yes");
    });
  });
});
