# LU Server

![Node.js CI](https://github.com/BonnierNews/lu-server/actions/workflows/nodejs.yml/badge.svg)

The base server for lu apps

## usage

```js
import express from "express";
import { buildApp, shutdownHandler } from "lu-server";

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
    process.exit(0); // eslint-disable-line n/no-process-exit
  } catch (error) {
    logger.error(error);
    process.exit(1); // eslint-disable-line n/no-process-exit
  }
});
```
