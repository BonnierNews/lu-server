"use strict";
const joi = require("joi");

function validator(field, schema, options = {}) {
  options = {
    ...{
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: false
    },
    ...options
  };
  return (req, res, next) => {
    joi.validate(req[field], schema, options, (err) => {
      if (err) {
        return res.status(400).json({
          errors: err.details.map(buildError)
        });
      }
      next();
    });
  };
}

function buildError(detail) {
  return {
    title: "ValidationError",
    status: "validation_error",
    source: {pointer: detail.path.join(".")},
    detail: detail.message
  };
}

module.exports = {
  body: validator.bind(validator, "body"),
  query: validator.bind(validator, "query"),
  params: validator.bind(validator, "params"),
  validator
};
