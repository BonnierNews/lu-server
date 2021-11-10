## LU Server

The base server for lu apps

## usage

```
const express = require("express");
const {buildApp, shutdownHandler} = require("lu-server");
const routes = express.Router();
routes.get("/", (req, res) => res.status(200).send("Hello World!"));
const app = buildApp(routes);

const server = app.listen(3000, () => {
  console.log(`listening on port ${server.address().port}`);
});
const terminateServer = shutdownHandler(server);
process.on("SIGTERM", async () => {
  try {
    await terminateServer();
    process.exit(0); // eslint-disable-line no-process-exit
  } catch (error) {
    logger.error(error);
    process.exit(1); // eslint-disable-line no-process-exit
  }
});
```

## Version notes:
v1.x supports node 8,10 (but works at least to node 14)
v2.x supports node 12,14,16
