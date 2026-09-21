import express from "express";
import { getHomepageSettings, updateHomepageSettings } from "../controllers/storefrontSettingController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/homepage", getHomepageSettings);
router.put("/homepage", protect, adminOnly, updateHomepageSettings);

export default router;
