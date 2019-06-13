"use strict";

function assert(expression, message, statusCode) {
  if (!expression) throw {message, statusCode};
}

module.exports = assert;
