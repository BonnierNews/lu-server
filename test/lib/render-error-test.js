"use strict";

const {render404, render409, renderError} = require("../../lib/render-error");
const assert = require("assert");

const expectedResultRender404 = {
  errors: [
    {
      detail: "Detail about the not found error",
      source: {
        pointer: "meta[correlationId]"
      },
      status: "not_found",
      title: "Not found"
    }
  ],
  meta: {
    correlationId: "364b5357-0000-4e47-bc85-7464eae8ec26"
  }
};

describe("Mapping a Render404", () => {
  it("Should map the render404", () => {
    let json;
    let statusCode;
    let correlationId;

    const res = {
      status: function (status) {
        statusCode = status;
        return this;
      },
      json: function (data) {
        json = data;
        return this;
      },
      get: function () {
        return (correlationId = "364b5357-0000-4e47-bc85-7464eae8ec26");
      }
    };
    render404(res, "Detail about the not found error", "meta[correlationId]");
    assert.deepEqual(statusCode, 404);
    assert.deepEqual(correlationId, expectedResultRender404.meta.correlationId);
    json.should.eql(expectedResultRender404);
  });
});

const expectedResultRender409 = {
  errors: [
    {
      detail: "Detail about the conflict error",
      source: {
        pointer: "meta[correlationId]"
      },
      status: "conflict",
      title: "Conflict"
    }
  ],
  type: "some-type",
  id: "some-id",
  meta: {
    correlationId: "364b5357-0000-4e47-bc85-7464eae8ec26"
  }
};

describe("Mapping a Render409", () => {
  it("Should map the render409", () => {
    let json;
    let statusCode;
    let correlationId;

    const res = {
      status: function (status) {
        statusCode = status;
        return this;
      },
      json: function (data) {
        json = data;
        return this;
      },
      get: function () {
        return (correlationId = "364b5357-0000-4e47-bc85-7464eae8ec26");
      }
    };
    render409(res, {type: "some-type", id: "some-id"}, "meta[correlationId]", "Detail about the conflict error");
    assert.deepEqual(statusCode, 409);
    assert.deepEqual(correlationId, expectedResultRender409.meta.correlationId);
    json.should.eql(expectedResultRender409);
  });
});

const expectedResultRenderError = {
  errors: [
    {
      detail: "Details about a server error",
      source: {
        pointer: "meta[correlationId]"
      },
      status: "server_error",
      title: "Server error"
    }
  ],
  meta: {
    correlationId: "364b5357-0000-4e47-bc85-7464eae8ec26"
  }
};

describe("Mapping a renderError with body", () => {
  it("Should map the renderError", () => {
    let json;
    let statusCode;
    let correlationId;
    const body = {type: "cancel-order", id: "98fdc6a2-b701-494b-b804-51995ac4209f"};
    const res = {
      status: function (status) {
        statusCode = status;
        return this;
      },
      body,
      json: function (data) {
        json = data;
        return this;
      },
      get: function () {
        return (correlationId = "364b5357-0000-4e47-bc85-7464eae8ec26");
      }
    };
    renderError(res, 500, {
      detail: "Details about a server error",
      source: {
        pointer: "meta[correlationId]"
      },
      status: "server_error",
      title: "Server error"
    });
    assert.deepEqual(statusCode, 500);
    assert.deepEqual(correlationId, expectedResultRenderError.meta.correlationId);
    json.should.eql(expectedResultRenderError);
  });
});
