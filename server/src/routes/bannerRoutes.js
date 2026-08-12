import express from "express";
import { uploadBannerImages } from "../middleware/bannerUpload.js";
import {
  createBanner,
  deleteBanner,
  getAllBanners,
  getBannerById,
  getPublicBanners,
  toggleBannerStatus,
  updateBanner,
} from "../controllers/bannerController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getPublicBanners);

router.get("/admin/all", protect, adminOnly, getAllBanners);
router.get("/admin/:id", protect, adminOnly, getBannerById);

router.post("/admin/create", protect, adminOnly, uploadBannerImages, createBanner);
router.put("/admin/:id", protect, adminOnly, uploadBannerImages, updateBanner);

router.patch("/admin/:id/toggle-status", protect, adminOnly, toggleBannerStatus);
router.delete("/admin/:id", protect, adminOnly, deleteBanner);

export default router;
