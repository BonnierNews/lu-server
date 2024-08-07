import config from "exp-config";
import { logger } from "lu-logger";

function validator(opts, options = {}) {
  options = {
    ...{
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: false,
    },
    ...options,
  };
  return (req, res, next) => {
    const errors = [];
    for (const field of [ "body", "query", "params" ]) {
      if (opts[field]) {
        const { error, value } = opts[field].validate(req[field], options);
        if (error) {
          errors.push(...error.details.map(buildError.bind(buildError, field)));
        }
        req[field] = value;
      }
    }
    if (errors.length > 0) {
      if (config.verboseValidationLogging) {
        logger.info(
          `Validation error on ${req.method} ${req.path} error: ${JSON.stringify(errors)} body: ${JSON.stringify(
            req.body
          )}`,
          req.debugMeta
        );
      }
      return res.status(400).json({ errors, meta: { correlationId: req.correlationId } });
    }
    next();
  };
}

function buildError(field, detail) {
  return {
    title: `ValidationError in ${field}`,
    status: "validation_error",
    source: { pointer: `${field}[${detail.path.join(".")}]` },
    detail: detail.message,
  };
}

function partial(fieldname, schema, options) {
  const opts = {};
  opts[fieldname] = schema;
  return validator(opts, options);
}

export default {
  body: partial.bind(partial, "body"),
  query: partial.bind(partial, "query"),
  params: partial.bind(partial, "params"),
  validator,
};
