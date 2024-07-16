import express from "express";
import http from "http";
import https from "https";
import bodyParser from "body-parser";
import config from "exp-config";

import middleware from "./lib/middleware.js";
import routes from "./lib/routes.js";
import { initHandleSigterm } from "./lib/handle-sigterm.js";

export default function init() {
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
  app.use(routes);

  return app;
}

// hack for appending the raw body
function appendRawBody(req, res, next) {
  req.on("data", (buf) => {
    req.rawBody = (req.rawBody || "") + buf;
  });
  next();
}
