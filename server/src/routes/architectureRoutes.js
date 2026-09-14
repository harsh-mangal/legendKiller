import express from "express";
import {
  getArchitectures,
  getArchitectureBySlug,
  createArchitecture,
  updateArchitecture,
  deleteArchitecture,
  seedArchitectures,
} from "../controllers/architectureController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getArchitectures);
router.get("/:slug", getArchitectureBySlug);
router.post("/", protect, adminOnly, createArchitecture);
router.put("/:id", protect, adminOnly, updateArchitecture);
router.delete("/:id", protect, adminOnly, deleteArchitecture);
router.post("/seed", protect, adminOnly, seedArchitectures);

export default router;
