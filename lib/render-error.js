"use strict";

function render404(res, detail, pointer) {
  const error = {
    title: "Not found",
    status: "not_found",
    source: { pointer },
    detail,
  };
  return renderError(res, 404, error);
}

function render409(res, body, pointer, detail) {
  return renderError(
    res,
    409,
    {
      title: "Conflict",
      status: "conflict",
      source: { pointer },
      detail,
    },
    body
  );
}

function renderError(res, code, error, body = {}) {
  return res.status(code).json({
    ...body,
    errors: [ error ],
    meta: { correlationId: res.get("correlation-id") },
  });
}

module.exports = {
  render404,
  render409,
  renderError,
};
