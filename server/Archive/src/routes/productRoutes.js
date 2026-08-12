import express from "express";
import { addProductReview, createProduct, deleteProduct, deleteProductReview, getProductBySlug, getProducts, getRelatedProducts, updateProduct, updateProductReviewStatus } from "../controllers/productController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { rateLimit } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/admin/all", protect, adminOnly, getProducts);
router.get("/:slug/related", getRelatedProducts);
router.post("/:slug/reviews", rateLimit({ windowMs: 60 * 60 * 1000, max: 5, key: (req) => `${req.ip}:${req.params.slug}` }), upload.array("media", 3), addProductReview);
router.patch("/:slug/reviews/:reviewId/status", protect, adminOnly, updateProductReviewStatus);
router.delete("/:slug/reviews/:reviewId", protect, adminOnly, deleteProductReview);
router.get("/:slug", getProductBySlug);
router.post("/", protect, adminOnly, upload.array("images", 6), createProduct);
router.put("/:id", protect, adminOnly, upload.array("images", 6), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
