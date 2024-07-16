import express from "express";

import buildApp from "../../lib/build-app.js";
import { initHandleSigterm } from "../../lib/handle-sigterm.js";

export const requests = [];
export const router = express.Router(); // eslint-disable-line new-cap

router.use((req, res, next) => {
  requests.push({ path: req.path, req, res });
  next();
});

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

router.post("/body", (req, res) => {
  res.status(200).json({
    body: req.body,
    rawBody: req.rawBody,
  });
});

router.get("/_status", (req, res) => {
  res.status(200).send("Yes");
});

initHandleSigterm();

export function reset() {
  requests.length = 0;
}

export const app = buildApp(router);

export default { requests, router, reset, app };
