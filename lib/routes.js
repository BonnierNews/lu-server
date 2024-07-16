import express from "express";

import alive from "./routes/alive.js";

const router = express.Router(); // eslint-disable-line new-cap
router.get("/_alive", alive);
router.head("/_alive", alive);

export default router;
