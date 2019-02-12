"use strict";
// eslint-disable-next-line new-cap
const joi = require("joi");
const validator = require("../../lib/validator");
const testMiddleware = require("../helpers/test-middleware");

const bodySchema = joi.object().keys({
  field1: joi
    .string()
    .min(1)
    .required(),
  field2: joi
    .string()
    .min(1)
    .required(),
  nested: joi
    .object()
    .keys({
      field3: joi
        .string()
        .min(2)
        .required()
    })
    .optional()
});

const paramsSchema = joi.object().keys({
  id: joi
    .string()
    .min(5)
    .required(),
  user: joi
    .string()
    .uuid()
    .required()
});
const middleware = validator.body(bodySchema, {allowUnknown: true});
const queryMiddleware = validator.query(bodySchema);
const paramsMiddleware = validator.params(paramsSchema);

describe("Body validator", () => {
  it("should pass valid body", async () => {
    const req = {
      body: {
        field1: "foo",
        field2: "bar",
        nested: {
          field3: "baz"
        }
      }
    };
    const response = await testMiddleware(middleware, req);
    response.next.should.eql(true);
  });

  it("should fail on invalid field", async () => {
    const req = {
      body: {
        field1: "foo"
      }
    };
    const response = await testMiddleware(middleware, req);
    response.statusCode.should.eql(400);
    response.body.should.eql({
      errors: [
        {
          title: "ValidationError",
          status: "validation_error",
          detail: '"field2" is required',
          source: {
            pointer: "field2"
          }
        }
      ]
    });
  });
  it("should fail on invalid fields", async () => {
    const req = {
      body: {}
    };
    const response = await testMiddleware(middleware, req);
    response.statusCode.should.eql(400);
    response.body.should.eql({
      errors: [
        {
          title: "ValidationError",
          status: "validation_error",
          detail: '"field1" is required',
          source: {
            pointer: "field1"
          }
        },
        {
          title: "ValidationError",
          status: "validation_error",
          detail: '"field2" is required',
          source: {
            pointer: "field2"
          }
        }
      ]
    });
  });

  it("should fail on nested field", async () => {
    const req = {
      body: {
        field1: "foo",
        field2: "foo",
        nested: {
          field3: "f"
        }
      }
    };
    const response = await testMiddleware(middleware, req);
    response.statusCode.should.eql(400);
    response.body.should.eql({
      errors: [
        {
          title: "ValidationError",
          status: "validation_error",
          detail: '"field3" length must be at least 2 characters long',
          source: {
            pointer: "nested.field3"
          }
        }
      ]
    });
  });
});

describe("query validator", () => {
  it("should pass valid query", async () => {
    const req = {
      query: {
        field1: "foo",
        field2: "bar",
        nested: {
          field3: "baz"
        }
      }
    };
    const response = await testMiddleware(queryMiddleware, req);
    response.next.should.eql(true);
  });

  it("should fail on invalid field", async () => {
    const req = {
      query: {
        field1: "foo"
      }
    };
    const response = await testMiddleware(queryMiddleware, req);
    response.statusCode.should.eql(400);
    response.body.should.eql({
      errors: [
        {
          title: "ValidationError",
          status: "validation_error",
          detail: '"field2" is required',
          source: {
            pointer: "field2"
          }
        }
      ]
    });
  });
  it("should fail on invalid fields", async () => {
    const req = {
      query: {}
    };
    const response = await testMiddleware(queryMiddleware, req);
    response.statusCode.should.eql(400);
    response.body.should.eql({
      errors: [
        {
          title: "ValidationError",
          status: "validation_error",
          detail: '"field1" is required',
          source: {
            pointer: "field1"
          }
        },
        {
          title: "ValidationError",
          status: "validation_error",
          detail: '"field2" is required',
          source: {
            pointer: "field2"
          }
        }
      ]
    });
  });

  it("should fail on nested field", async () => {
    const req = {
      query: {
        field1: "foo",
        field2: "foo",
        nested: {
          field3: "f"
        }
      }
    };
    const response = await testMiddleware(queryMiddleware, req);
    response.statusCode.should.eql(400);
    response.body.should.eql({
      errors: [
        {
          title: "ValidationError",
          status: "validation_error",
          detail: '"field3" length must be at least 2 characters long',
          source: {
            pointer: "nested.field3"
          }
        }
      ]
    });
  });
});

describe("params validator", () => {
  it("should pass valid params", async () => {
    const req = {
      params: {
        id: "foobar",
        user: "18e426bb-acbc-415a-8234-679ec8f0a8ec"
      }
    };
    const response = await testMiddleware(paramsMiddleware, req);
    response.next.should.eql(true);
  });

  it("should fail on invalid field", async () => {
    const req = {
      params: {
        id: "foobar"
      }
    };
    const response = await testMiddleware(paramsMiddleware, req);
    response.next.should.eql(false);
    response.statusCode.should.eql(400);
    response.body.should.eql({
      errors: [
        {
          title: "ValidationError",
          status: "validation_error",
          detail: '"user" is required',
          source: {
            pointer: "user"
          }
        }
      ]
    });
  });

  it("should fail on invalid fields", async () => {
    const req = {
      params: {
        id: "foo"
      }
    };
    const response = await testMiddleware(paramsMiddleware, req);
    response.statusCode.should.eql(400);
    response.body.should.eql({
      errors: [
        {
          title: "ValidationError",
          status: "validation_error",
          detail: '"id" length must be at least 5 characters long',
          source: {
            pointer: "id"
          }
        },
        {
          title: "ValidationError",
          status: "validation_error",
          detail: '"user" is required',
          source: {
            pointer: "user"
          }
        }
      ]
    });
  });
});
