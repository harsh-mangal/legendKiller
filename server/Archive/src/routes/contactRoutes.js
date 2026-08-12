import express from "express";
import { createContactMessage } from "../controllers/contactController.js";
import { rateLimit } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();
router.post("/", rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), createContactMessage);
export default router;
