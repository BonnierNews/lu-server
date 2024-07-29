import express from "express";
import http from "http";
import https from "https";
import bodyParser from "body-parser";
import config from "exp-config";

import middleware from "./middleware.js";
import statusRoutes from "./routes.js";
import { initHandleSigterm } from "./handle-sigterm.js";
import notFoundHandler from "./notFoundHandler.js";
import errorHandler from "./errorHandler.js";
import validateConfig from "./config-validator.js";

export default function buildApp(routes) {
  validateConfig(config);

  const app = express();

  app.disable("x-powered-by");

  app.use(appendRawBody);
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.text({ type: "text/*" }));
  const limit = (config.express && config.express.body && config.express.body.limit) || "200kb";
  app.use(bodyParser.json({ limit }));

  // Don't limit the number of outgoing HTTP requests (defaults to 4 simultaneous requests)
  http.globalAgent.maxSockets = Infinity;
  https.globalAgent.maxSockets = Infinity;

  process.env.TZ = "Europe/Stockholm";
  if (config.luServerShutdown) {
    initHandleSigterm();
  }

  app.use(middleware);
  app.use(statusRoutes);

  if (routes) {
    app.use(routes);
  }

  if (config.logClientIp) app.enable("trust proxy");

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

// hack for appending the raw body
function appendRawBody(req, res, next) {
  req.on("data", (buf) => {
    req.rawBody = (req.rawBody || "") + buf;
  });
  next();
}
