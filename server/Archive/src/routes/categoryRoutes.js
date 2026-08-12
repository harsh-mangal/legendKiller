import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/admin/all", protect, adminOnly, (req, res, next) => { req.query.includeInactive = "true"; next(); }, getCategories);

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  createCategory
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  updateCategory
);

router.delete("/:id", protect, adminOnly, deleteCategory);

export default router;
