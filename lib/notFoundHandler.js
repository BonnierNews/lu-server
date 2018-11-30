"use strict";

function notFoundHandler(req, res) {
  return res.status(404).json({
    errors: [
      {
        status: "404",
        title: "Not Found",
        source: req.path,
        detail: `No resource ${req.method} ${req.path}`
      }
    ]
  });
}

module.exports = notFoundHandler;
