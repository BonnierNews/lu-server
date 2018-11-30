"use strict";
const express = require("express");
const buildApp = require("../../").buildApp;

const router = express.Router(); // eslint-disable-line new-cap
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


module.exports = buildApp(router);
