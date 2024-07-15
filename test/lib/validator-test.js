import joi from "joi";

import validator from "../../lib/validator.js";
import testMiddleware from "../helpers/test-middleware.js";

const bodySchema = joi.object().keys({
  field1: joi.string().min(1).required(),
  field2: joi.string().min(1).required(),
  nested: joi
    .object()
    .keys({ field3: joi.string().min(2).required() })
    .optional(),
});

const paramsSchema = joi.object().keys({
  id: joi.string().min(5).required(),
  user: joi.string().uuid().required(),
});
const middleware = validator.body(bodySchema, { allowUnknown: true });
const queryMiddleware = validator.query(bodySchema);
const paramsMiddleware = validator.params(paramsSchema);

describe("Body validator", () => {
  it("should pass valid body", async () => {
    const req = {
      body: {
        field1: "foo",
        field2: "bar",
        nested: { field3: "baz" },
      },
      correlationId: "some-corr-id",
    };
    const response = await testMiddleware(middleware, req);
    response.next.should.eql(true);
  });

  it("should fail on invalid field", async () => {
    const req = {
      body: { field1: "foo" },
      correlationId: "some-corr-id",
    };
    const response = await testMiddleware(middleware, req);
    response.statusCode.should.eql(400);
    response.body.should.eql({
      errors: [
        {
          title: "ValidationError in body",
          status: "validation_error",
          detail: '"field2" is required',
          source: { pointer: "body[field2]" },
        },
      ],
      meta: { correlationId: "some-corr-id" },
    });
  });
  it("should fail on invalid fields", async () => {
    const req = {
      body: {},
      correlationId: "some-corr-id",
    };
    const response = await testMiddleware(middleware, req);
    response.statusCode.should.eql(400);
    response.body.should.eql({
      errors: [
        {
          title: "ValidationError in body",
          status: "validation_error",
          detail: '"field1" is required',
          source: { pointer: "body[field1]" },
        },
        {
          title: "ValidationError in body",
          status: "validation_error",
          detail: '"field2" is required',
          source: { pointer: "body[field2]" },
        },
      ],
      meta: { correlationId: "some-corr-id" },
    });
  });

  it("should fail on nested field", async () => {
    const req = {
      body: {
        field1: "foo",
        field2: "foo",
        nested: { field3: "f" },
      },
      correlationId: "some-corr-id",
    };
    const response = await testMiddleware(middleware, req);
    response.statusCode.should.eql(400);
    response.body.should.eql({
      errors: [
        {
          title: "ValidationError in body",
          status: "validation_error",
          detail: '"nested.field3" length must be at least 2 characters long',
          source: { pointer: "body[nested.field3]" },
        },
      ],
      meta: { correlationId: "some-corr-id" },
    });
  });
});

describe("query validator", () => {
  it("should pass valid query", async () => {
    const req = {
      query: {
        field1: "foo",
        field2: "bar",
        nested: { field3: "baz" },
      },
      correlationId: "some-corr-id",
    };
    const response = await testMiddleware(queryMiddleware, req);
    response.next.should.eql(true);
  });

  it("should fail on invalid field", async () => {
    const req = {
      query: { field1: "foo" },
      correlationId: "some-corr-id",
    };
    const response = await testMiddleware(queryMiddleware, req);
    response.statusCode.should.eql(400);
    response.body.should.eql({
      errors: [
        {
          title: "ValidationError in query",
          status: "validation_error",
          detail: '"field2" is required',
          source: { pointer: "query[field2]" },
        },
      ],
      meta: { correlationId: "some-corr-id" },
    });
  });
  it("should fail on invalid fields", async () => {
    const req = {
      query: {},
      correlationId: "some-corr-id",
    };
    const response = await testMiddleware(queryMiddleware, req);
    response.statusCode.should.eql(400);
    response.body.should.eql({
      errors: [
        {
          title: "ValidationError in query",
          status: "validation_error",
          detail: '"field1" is required',
          source: { pointer: "query[field1]" },
        },
        {
          title: "ValidationError in query",
          status: "validation_error",
          detail: '"field2" is required',
          source: { pointer: "query[field2]" },
        },
      ],
      meta: { correlationId: "some-corr-id" },
    });
  });

  it("should fail on nested field", async () => {
    const req = {
      query: {
        field1: "foo",
        field2: "foo",
        nested: { field3: "f" },
      },
      correlationId: "some-corr-id",
    };
    const response = await testMiddleware(queryMiddleware, req);
    response.statusCode.should.eql(400);
    response.body.should.eql({
      errors: [
        {
          title: "ValidationError in query",
          status: "validation_error",
          detail: '"nested.field3" length must be at least 2 characters long',
          source: { pointer: "query[nested.field3]" },
        },
      ],
      meta: { correlationId: "some-corr-id" },
    });
  });
});

describe("params validator", () => {
  it("should pass valid params", async () => {
    const req = {
      params: {
        id: "foobar",
        user: "18e426bb-acbc-415a-8234-679ec8f0a8ec",
      },
      correlationId: "some-corr-id",
    };
    const response = await testMiddleware(paramsMiddleware, req);
    response.next.should.eql(true);
  });

  it("should fail on invalid field", async () => {
    const req = {
      params: { id: "foobar" },
      correlationId: "some-corr-id",
    };
    const response = await testMiddleware(paramsMiddleware, req);
    response.next.should.eql(false);
    response.statusCode.should.eql(400);
    response.body.should.eql({
      errors: [
        {
          title: "ValidationError in params",
          status: "validation_error",
          detail: '"user" is required',
          source: { pointer: "params[user]" },
        },
      ],
      meta: { correlationId: "some-corr-id" },
    });
  });

  it("should fail on invalid fields", async () => {
    const req = {
      params: { id: "foo" },
      correlationId: "some-corr-id",
    };
    const response = await testMiddleware(paramsMiddleware, req);
    response.statusCode.should.eql(400);
    response.body.should.eql({
      errors: [
        {
          title: "ValidationError in params",
          status: "validation_error",
          detail: '"id" length must be at least 5 characters long',
          source: { pointer: "params[id]" },
        },
        {
          title: "ValidationError in params",
          status: "validation_error",
          detail: '"user" is required',
          source: { pointer: "params[user]" },
        },
      ],
      meta: { correlationId: "some-corr-id" },
    });
  });
});

describe("Multiple validations", () => {
  it("should fail on invalid field", async () => {
    const req = {
      params: { id: "foobar" },
      query: { field1: "foobar" },
      body: { field1: "foobar" },
      correlationId: "some-corr-id",
    };
    const combined = validator.validator({ body: bodySchema, query: bodySchema, params: paramsSchema });
    const response = await testMiddleware(combined, req);
    response.next.should.eql(false);
    response.statusCode.should.eql(400);
    response.body.should.eql({
      errors: [
        {
          title: "ValidationError in body",
          status: "validation_error",
          detail: '"field2" is required',
          source: { pointer: "body[field2]" },
        },
        {
          detail: '"field2" is required',
          source: { pointer: "query[field2]" },
          status: "validation_error",
          title: "ValidationError in query",
        },
        {
          detail: '"user" is required',
          source: { pointer: "params[user]" },
          status: "validation_error",
          title: "ValidationError in params",
        },
      ],
      meta: { correlationId: "some-corr-id" },
    });
  });

  it("should default fields", async () => {
    const schema = joi.object().keys({
      field1: joi.string().default("one"),
      field2: joi.string().default("two"),
    });

    const req = {
      params: {},
      query: { field2: "field2" },
      body: { field1: "foobar" },
      correlationId: "some-corr-id",
    };
    const combined = validator.validator({ body: schema, query: schema, params: schema });
    const response = await testMiddleware(combined, req);
    response.next.should.eql(true);
    response.body.should.eql({
      field1: "foobar",
      field2: "two",
    });
    response.query.should.eql({
      field1: "one",
      field2: "field2",
    });
    response.params.should.eql({
      field1: "one",
      field2: "two",
    });
  });
});
