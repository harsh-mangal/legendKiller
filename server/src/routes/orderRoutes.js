import express from "express";
import {
  cancelOrder,
  createGuestOrder,
  createOrder,
  downloadInvoice,
  getAllOrders,
  getOrderById,
  myOrders,
  requestReturn,
  resolveReturnRequest,
  retryPayment,
  trackGuestOrder,
  updateOrderStatus,
  verifyRazorpayPayment,
} from "../controllers/orderController.js";
import { adminOnly, optionalAuth, protect } from "../middleware/authMiddleware.js";
import { rateLimit } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();
router.post("/guest", rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), createGuestOrder);
router.post("/track", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }), trackGuestOrder);
router.post("/razorpay/verify", rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }), verifyRazorpayPayment);
router.post("/", protect, rateLimit({ windowMs: 15 * 60 * 1000, max: 20, key: (req) => req.user?._id }), createOrder);
router.get("/my-orders", protect, myOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.get("/:id", protect, getOrderById);
router.post("/:id/retry-payment", optionalAuth, rateLimit({ windowMs: 15 * 60 * 1000, max: 15 }), retryPayment);
router.post("/:id/cancel", protect, cancelOrder);
router.post("/:id/returns", protect, requestReturn);
router.get("/:id/invoice", protect, downloadInvoice);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.put("/:id/returns/:returnId", protect, adminOnly, resolveReturnRequest);
export default router;
