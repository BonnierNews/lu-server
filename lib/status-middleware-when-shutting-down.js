import { logger } from "lu-logger";

import { isShuttingDown, shutdownDebugMeta } from "./handle-sigterm.js";

// When have received SIGTERM we should send 500 as readiness to inform OC that we do not want traffic
export default function statusWhenShuttingDown(req, res, next) {
  if (req.path.startsWith("/_status") && isShuttingDown()) {
    logger.info("sending 500 on _status due to sigterm", shutdownDebugMeta());
    return res.sendStatus(500);
  }
  return next();
}
