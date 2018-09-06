"use strict";

const request = require("supertest");
const app = require("../helpers/app");

Feature("App mounting", () => {
  Scenario("Mounting routes to an app", () => {
    Given("A router with some routes", () => {});
    When("Requesting and return status code will return 200 Yes", (done) => {
      request(app)
        .get("/some-path")
        .expect(200)
        .expect("Yes")
        .end(done);
    });
  });

  Scenario("Not found handling", () => {

    Given("A router with some routes", () => {});

    When("Requesting an unknown route will return 404 json", (done) => {
      request(app)
        .get("/unknown")
        .expect(404)
        .expect("Content-Type", /json/)
        .end((err, res) => {
          if (err) return done(err);
          res.body.should.eql({
            errors: [{
              status: "404",
              source: "/unknown",
              detail: "No resource GET /unknown",
              title: "Not Found"
            }]
          });
          done();
        });
    });
  });

  Scenario("Error handling", () => {

    Given("A router with a routes that yields an error", () => {});

    When("Requesting an unknown route will return 500 json", (done) => {
      request(app)
        .get("/error")
        .expect(500)
        .expect("Content-Type", /json/)
        .end((err, res) => {
          if (err) return done(err);
          res.body.should.eql({
            errors: [{
              status: "500",
              title: "Server Error",
              detail: "GET /error: Error: Foo",
              source: "/error"
            }]
          });
          done();
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
