import config from "exp-config";
import util from "util";
import { logger } from "lu-logger";

export default function errorHandler(err, req, res, next) {
  const correlationId = req.correlationId;
  if (!err) return next();
  let errorMessage = err instanceof Error ? err.toString() : JSON.stringify(err);
  logger.error(util.format("Error received in errorHandler:", err, correlationId, req.originalUrl), req.debugMeta);

  if (config.envName === "production") {
    errorMessage = `Internal error! Request id: ${correlationId}`;
  }

  const errors = [
    {
      status: "500",
      title: "Server Error",
      source: `${req.originalUrl}`,
      detail: `${req.method} ${req.originalUrl}: ${errorMessage}`,
    },
  ];

  if (config.boolean("showErrorStackOnRequests")) {
    errors[0].source = err.stack;
  }

  res.status(500).json({ errors, meta: req.debugMeta });
}
