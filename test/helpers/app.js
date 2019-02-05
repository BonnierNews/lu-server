"use strict";
const express = require("express");
const buildApp = require("../../").buildApp;

const requests = [];
const router = express.Router(); // eslint-disable-line new-cap
router.get("/some-path", (req, res) => {
  requests.push({req, res});
  res.status(200).send("Yes");
});
router.get("/error", (req, res, next) => {
  requests.push({req, res});
  next(new Error("Foo"));
});
router.get("/timeouterror", (req, res, next) => {
  requests.push({req, res});
  setTimeout(() => next(new Error("we did timeout")), 10);
});
router.get("/bork", () => {
  requests.push({req, res});
  throw new Error("Bork!");
});


function reset() {
  requests.length = 0;
}

module.exports = {
  requests,
  router,
  reset,
  app: buildApp(router)
}
