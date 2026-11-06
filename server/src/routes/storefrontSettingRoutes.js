import express from "express";
import { getArticleSettings, updateArticleSettings, getHomepageSettings, updateHomepageSettings } from "../controllers/storefrontSettingController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/homepage", getHomepageSettings);
router.put("/homepage", protect, adminOnly, updateHomepageSettings);
router.get("/articles", getArticleSettings);
router.put("/articles", protect, adminOnly, upload.single("banner"), updateArticleSettings);

export default router;
