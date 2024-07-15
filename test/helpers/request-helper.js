import supertest from "supertest";
import pathLib from "path";

import { app } from "./app.js";

export function get(path) {
  return supertest(app).get(path).set("correlation-id", caller());
}

export function post(path, body) {
  const callingFunction = caller();
  return supertest(app).post(path).set("correlation-id", callingFunction).send(body);
}

/**
 * Module wrapper of @substack's `caller.js` (stolen from https://github.com/totherik/caller/blob/master/index.js)
 * @original: https://github.com/substack/node-resolve/blob/master/lib/caller.js
 * @blessings: https://twitter.com/eriktoth/statuses/413719312273125377
 * @see https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
 */
function caller(depth) {
  let stack, file, frame;

  const pst = Error.prepareStackTrace;
  Error.prepareStackTrace = function (_, innerStack) {
    Error.prepareStackTrace = pst;
    return innerStack;
  };

  stack = new Error().stack;
  if (!depth || isNaN(depth)) {
    depth = 1;
  } else {
    depth = depth > stack.length - 2 ? stack.length - 2 : depth;
  }
  stack = stack.slice(depth + 1);

  do {
    frame = stack.shift();
    file = frame && frame.getFileName();
  } while (stack.length && file === "module.js");

  const calleePath = pathLib.relative(process.cwd(), file);

  return `./${calleePath}:${frame.getLineNumber()}`;
}

export default { get, post };
