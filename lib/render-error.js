"use strict";

function render404(res, detail, pointer) {
  const error = {
    title: "Not found",
    status: "not_found",
    source: {
      pointer: pointer
    },
    detail: detail
  };
  return renderError(res, 404, error);
}

function renderError(res, code, error, body = {}) {
  return res.status(code).json({
    ...body,
    errors: [error],
    meta: {correlationId: res.get("correlation-id")}
  });
}

module.exports = {
  render404,
  renderError
};
