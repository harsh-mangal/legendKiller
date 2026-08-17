import express from "express";
import {
  addProductReview,
  createProduct,
  deleteProduct,
  deleteProductReview,
  getProductBySlug,
  getProductQrCode,
  getProducts,
  getRelatedProducts,
  updateProduct,
  updateProductReviewStatus,
  verifyProductByCode,
} from "../controllers/productController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { upload, uploadProductMedia } from "../middleware/uploadMiddleware.js";
import { rateLimit } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/admin/all", protect, adminOnly, (req, res, next) => { req.adminView = true; next(); }, getProducts);
router.get("/verify/:code", verifyProductByCode);
router.get("/:id/qrcode", getProductQrCode);
router.get("/:slug/related", getRelatedProducts);
router.post("/:slug/reviews", protect, rateLimit({ windowMs: 60 * 60 * 1000, max: 5, key: (req) => `${req.ip}:${req.params.slug}` }), upload.array("media", 3), addProductReview);
router.patch("/:slug/reviews/:reviewId/status", protect, adminOnly, updateProductReviewStatus);
router.delete("/:slug/reviews/:reviewId", protect, adminOnly, deleteProductReview);
router.get("/:slug", getProductBySlug);
router.post("/", protect, adminOnly, uploadProductMedia, createProduct);
router.put("/:id", protect, adminOnly, uploadProductMedia, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
