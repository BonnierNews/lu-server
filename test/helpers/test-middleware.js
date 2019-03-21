"use strict";

function mockResponse(callback) {
  const expected = {next: false};
  const res = {
    status: (code) => {
      expected.statusCode = code;
      return res;
    },
    json: (body) => {
      expected.body = body;
      return callback(expected);
    }
  };

  return res;
}

function testMiddleware(middleware, request) {
  return new Promise((resolve) => {
    middleware(request, mockResponse(resolve), () => {
      resolve({next: true, body: request.body, query: request.query, params: request.params});
    });
  });
}

module.exports = testMiddleware;
