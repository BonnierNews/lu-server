import { expect } from "chai";

import { get } from "../helpers/request-helper.js";

Feature("Error handling", () => {
  Scenario("Correlation id feature, no correlation id sent", () => {
    Given("A route", () => {});
    When("Requesting without correlation id shold return 200 Yes with a correlation id set", async () => {
      const res = await get("/bork").expect(500);
      expect(res.headers).to.have.property("correlation-id");
    });
  });

  Scenario("Correlation id feature, correlation id sent", () => {
    Given("A route", () => {});
    When("Requesting with a correlation id shold return 200 Yes with the correlation id set", async () => {
      const res = await get("/bork").set("correlation-id", "foo").expect(500);

      expect(res.headers["correlation-id"]).to.equal("foo");
      expect(res.body.meta.correlationId.should.eql("foo"));
    });
  });
});
