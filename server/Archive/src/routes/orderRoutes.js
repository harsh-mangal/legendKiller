import express from "express";
import {
  createOrder,
  createGuestOrder,
  verifyRazorpayPayment,
  myOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/guest", createGuestOrder);
router.post("/razorpay/verify", verifyRazorpayPayment);
router.post("/", protect, createOrder);
router.get("/my-orders", protect, myOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;