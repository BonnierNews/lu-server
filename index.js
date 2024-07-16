import config from "exp-config";
import { logger } from "lu-logger";
import * as fs from "fs";
import * as path from "path";

import shutdownHandler from "./lib/shutdownHandler.js";
import sigtermHandler from "./lib/handle-sigterm.js";
import errorHelper from "./lib/render-error.js";
import validator from "./lib/validator.js";
import buildApp from "./lib/build-app.js";

export function init(routes) {
  const packageInfo = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json")));

  const app = buildApp(routes);

  const port = Number(process.env.PORT) || config.port || 3000;
  const server = app.listen(port, () => {
    logger.info(`${packageInfo.name} listening on port ${server.address().port}`);
  });
  logger.info("initiating sigterm handler with shutdown handler");
  sigtermHandler.registerServerTerminator(shutdownHandler(server));
}

export { shutdownHandler, sigtermHandler, errorHelper, validator };

export default {
  init,
  shutdownHandler,
  sigtermHandler,
  errorHelper,
  validator,
};
