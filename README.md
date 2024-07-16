# LU Server

![Node.js CI](https://github.com/BonnierNews/lu-server/actions/workflows/nodejs.yml/badge.svg)

The base server for lu apps

## usage

```js
import express from "express";
import { init } from "lu-server";

const routes = express.Router();
routes.get("/", (req, res) => res.status(200).send("Hello World!"));

const { app, start } = init(routes);

if (import.meta.url.endsWith(process.argv[1])) {
  start();
}

export default app; // for testing
```
