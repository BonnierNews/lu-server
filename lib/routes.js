"use strict";

const express = require("express");
const alive = require("./routes/alive.js");
const prometheus = require("./routes/prometheus");

const router = express.Router();
router.get("/_alive", alive);
router.head("/_alive", alive);
router.get("/metrics/", prometheus.metrics);

module.exports = router;
