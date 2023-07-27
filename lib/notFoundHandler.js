"use strict";

function notFoundHandler(req, res) {
  return res.status(404).json({
    errors: [
      {
        status: "404",
        title: "Not Found",
        source: req.originalUrl,
        detail: `No resource ${req.method} ${req.originalUrl}`,
      },
    ],
    meta: req.debugMeta,
  });
}

module.exports = notFoundHandler;
