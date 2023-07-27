"use strict";
const { logger } = require("lu-logger");
const handleSigterm = require("./handle-sigterm");

// When have received SIGTERM we should send 500 as readiness to inform OC that we do not want traffic
function statusWhenShuttingDown(req, res, next) {
  if (req.path.startsWith("/_status") && handleSigterm.isShuttingDown()) {
    logger.info("sending 500 on _status due to sigterm", handleSigterm.shutdownDebugMeta());
    return res.sendStatus(500);
  }
  return next();
}

module.exports = statusWhenShuttingDown;
