import express from "express";
import { checkDelivery, getDeliverySettings, updateDeliverySettings } from "../controllers/deliveryController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/check", checkDelivery);
router.get("/admin/settings", protect, adminOnly, getDeliverySettings);
router.put("/admin/settings", protect, adminOnly, updateDeliverySettings);
export default router;
