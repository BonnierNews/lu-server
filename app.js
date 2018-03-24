"use strict";

const setupApp = require("./lib/setupApp");
const config = require("exp-config");
const logger = require("lu-logger")(config.logging);

const app = setupApp((err) => {
  const packageInfo = require("./package.json");
  global.__basePath = __dirname;

  if (err) {
    logger.error("Failed to initialize app, aborting startup", err);
    throw new Error("App initialization failed", err);
  }
  // Only listen if started, not if included
  if (require.main === module) {
    const port = Number(process.env.PORT) || config.port || 3000;
    const server = app.listen(port, () => {
      logger.info(`${packageInfo.name} listening on port ${server.address().port}`);
    });
  }
});

module.exports = app; // Expose app to tests
