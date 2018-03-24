"use strict";
const config = require("exp-config");

function getStatus(req, res) {
  return res.status(200).json({
    podName: config.HOSTNAME,
    services: {"all": "OK"}
  });
}

module.exports = getStatus;
