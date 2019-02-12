"use strict";
const joi = require("joi");

function validator(opts, options = {}) {
  options = {
    ...{
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: false
    },
    ...options
  };
  return (req, res, next) => {
    const errors = [];
    for (const field of ["body", "query", "params"]) {
      if (opts[field]) {
        const {error} = joi.validate(req[field], opts[field], options);
        if (error) {
          errors.push(...error.details.map(buildError.bind(buildError, field)));
        }
      }
    }
    if (errors.length > 0) {
      return res.status(400).json({errors});
    }
    next();
  };
}

function buildError(field, detail) {
  return {
    title: `ValidationError in ${field}`,
    status: "validation_error",
    source: {pointer: `${field}[${detail.path.join(".")}]`},
    detail: detail.message
  };
}

function partial(fieldname, schema, options) {
  const opts = {};
  opts[fieldname] = schema;
  return validator(opts, options);
}

module.exports = {
  body: partial.bind(partial, "body"),
  query: partial.bind(partial, "query"),
  params: partial.bind(partial, "params"),
  validator
};
