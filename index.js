import config from "exp-config";
import { logger } from "lu-logger";
import * as fs from "fs";
import * as path from "path";

import shutdownHandler from "./lib/shutdownHandler.js";
import { registerServerTerminator } from "./lib/handle-sigterm.js";
import { render404, render409, renderError } from "./lib/render-error.js";
import validator from "./lib/validator.js";
import buildApp from "./lib/build-app.js";

export function init(routes) {
  const app = buildApp(routes);

  const start = () => {
    const packageInfo = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json")));

    const port = Number(process.env.PORT) || config.port || 3000;
    const server = app.listen(port, () => {
      logger.info(`${packageInfo.name} listening on port ${server.address().port}`);
    });
    logger.info("initiating sigterm handler with shutdown handler");
    registerServerTerminator(shutdownHandler(server));
  };
  return { app, start };
}

export { render404, render409, renderError, shutdownHandler, validator };

export default { init, render404, render409, renderError, shutdownHandler, validator };
