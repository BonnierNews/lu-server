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

module.exports = buildApp(router);
