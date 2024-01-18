"use strict";

const express = require("express");
const alive = require("./routes/alive.js");

const router = express.Router(); // eslint-disable-line new-cap
router.get("/_alive", alive);
router.head("/_alive", alive);

module.exports = router;
