import config from "exp-config";

import notFoundHandler from "./lib/notFoundHandler.js";
import errorHandler from "./lib/errorHandler.js";
import appBuilder from "./app.js";
import shutdownHandler from "./lib/shutdownHandler.js";
import sigtermHandler from "./lib/handle-sigterm.js";
import errorHelper from "./lib/render-error.js";
import validator from "./lib/validator.js";

export function buildApp(routes) {
  const app = appBuilder();
  if (routes) {
    app.use(routes);
  }

  if (config.logClientIp) app.enable("trust proxy");

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export { shutdownHandler, sigtermHandler, errorHelper, validator };

export default {
  buildApp,
  shutdownHandler,
  sigtermHandler,
  errorHelper,
  validator,
};
