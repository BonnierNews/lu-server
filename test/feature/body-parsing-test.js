"use strict";

const request = require("supertest");
const {app, requests, reset} = require("../helpers/app");
const expect = require("chai").expect;

Feature("Request body sent to server", () => {
  Scenario("Sending a json body", () => {
    before(reset);

    let req;
    When("Requesting the body path", async () => {
      await request(app)
        .post("/body")
        .send({hej: "hopp"})
        .expect(200);
    });

    Then("the response should hold the body", () => {
      req = requests.pop().req;
      req.body.should.eql({
        hej: "hopp"
      });
    });

    And("the response should hold the rawBody", () => {
      req.rawBody.toString().should.eql('{"hej":"hopp"}');
    });
  });

  Scenario("Sending an empty body", () => {
    before(reset);

    let req;
    When("Requesting the body path", async () => {
      await request(app)
        .post("/body")
        .expect(200);
    });

    Then("the response should hold the body", () => {
      req = requests.pop().req;
      req.body.should.eql({});
    });

    And("the response should hold the rawBody", () => {
      expect(req.rawBody).to.eql(undefined);
    });
  });

  Scenario("Sending an bigger body then default bodyparse limit", () => {
    before(reset);
    let bigBodyBuf;
    Given("A big body", () => {
      bigBodyBuf = Buffer.allocUnsafe(150 * 1000);
      bigBodyBuf.fill("a");
    });
    let req;
    When("Requesting the body path", async () => {
      await request(app)
        .post("/body")
        .send({buf: bigBodyBuf.toString()})
        .expect(200);
    });

    Then("the response should hold the body", () => {
      req = requests.pop().req;
      req.body.should.eql({buf: bigBodyBuf.toString()});
    });
  });
  Scenario("Sending an bigger body then current set bodyparse limit", () => {
    before(reset);
    let bigBodyBuf;
    Given("A big body", () => {
      bigBodyBuf = Buffer.allocUnsafe(250 * 1000);
      bigBodyBuf.fill("a");
    });
    When("Requesting the body path", async () => {
      await request(app)
        .post("/body")
        .send({buf: bigBodyBuf.toString()})
        .expect(500);
    });
  });
});
