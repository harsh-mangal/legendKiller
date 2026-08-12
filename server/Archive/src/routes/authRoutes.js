import express from "express";
import { getProfile, loginUser, loginWithOtp, registerUser, requestLoginOtp } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { rateLimit } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.post("/register", rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }), registerUser);
router.post("/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), loginUser);
router.post("/request-otp", rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), requestLoginOtp);
router.post("/login-otp", rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), loginWithOtp);
router.get("/profile", protect, getProfile);

export default router;
