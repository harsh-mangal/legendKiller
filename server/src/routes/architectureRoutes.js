import express from "express";
import {
  getArchitectures,
  getAdminArchitectures,
  getArchitectureBySlug,
  createArchitecture,
  updateArchitecture,
  deleteArchitecture,
  seedArchitectures,
} from "../controllers/architectureController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getArchitectures);
router.get("/admin", protect, adminOnly, getAdminArchitectures);
router.get("/:slug", getArchitectureBySlug);
router.post("/", protect, adminOnly, upload.single("image"), createArchitecture);
router.put("/:id", protect, adminOnly, upload.single("image"), updateArchitecture);
router.delete("/:id", protect, adminOnly, deleteArchitecture);
router.post("/seed", protect, adminOnly, seedArchitectures);

export default router;
