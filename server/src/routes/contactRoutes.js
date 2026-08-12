import express from "express";
import { createContactMessage, listContactMessages, updateContactStatus } from "../controllers/contactController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { rateLimit } from "../middleware/rateLimitMiddleware.js";
const router = express.Router();
router.post("/", rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), createContactMessage);
router.get("/admin", protect, adminOnly, listContactMessages);
router.patch("/admin/:id/status", protect, adminOnly, updateContactStatus);
export default router;
