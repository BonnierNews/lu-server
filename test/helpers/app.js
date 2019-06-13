"use strict";
const express = require("express");
const {buildApp, assert} = require("../../");

const requests = [];
const router = express.Router(); // eslint-disable-line new-cap
router.use((req, res, next) => {
  requests.push({path: req.path, req, res});
  next();
});
router.get("/some-path", (req, res) => {
  res.status(200).send("Yes");
});
router.get("/error", (req, res, next) => {
  next(new Error("Foo"));
});
router.get("/timeouterror", (req, res, next) => {
  setTimeout(() => next(new Error("we did timeout")), 10);
});
router.get("/bork", () => {
  throw new Error("Bork!");
});

router.get("/bork/assert", () => {
  assert("bork" === "cork", "bork bork", 418);
});

router.post("/body", (req, res) => {
  res.status(200).json({
    body: req.body,
    rawBody: req.rawBody
  });
});

function reset() {
  requests.length = 0;
}

module.exports = {
  requests,
  router,
  reset,
  app: buildApp(router)
};
