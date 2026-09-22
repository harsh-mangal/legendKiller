import express from "express";
import PartnerInquiry from "../models/PartnerInquiry.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { rateLimit } from "../middleware/rateLimitMiddleware.js";
import { ApiError } from "../utils/apiError.js";
import { isEmail, normalizeEmail, normalizePhone } from "../utils/validation.js";

const router = express.Router();
const clean = (value, max) => String(value || "").trim().slice(0, max);

router.post("/", rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), async (req, res, next) => {
  try {
    const body = req.body || {};
    const inquiry = {
      firstName: clean(body.firstName, 100), lastName: clean(body.lastName, 100),
      gstNumber: clean(body.gstNumber, 15).toUpperCase(), email: normalizeEmail(body.email),
      contactNumber: normalizePhone(body.contactNumber), address: clean(body.address, 500),
      state: clean(body.state, 100), category: clean(body.category, 100),
      expectedMonthlySales: clean(body.expectedMonthlySales, 100),
      message: clean(body.message, 3000), currentBusiness: clean(body.currentBusiness, 500),
    };
    if (!inquiry.firstName || !inquiry.email || !inquiry.contactNumber || !inquiry.address || !inquiry.state || !inquiry.category || !inquiry.expectedMonthlySales || !inquiry.currentBusiness) {
      throw new ApiError(400, "Please complete every required field");
    }
    if (!isEmail(inquiry.email)) throw new ApiError(400, "Enter a valid email address");
    if (!/^[6-9][0-9]{9}$/.test(inquiry.contactNumber)) throw new ApiError(400, "Enter a valid 10-digit Indian mobile number");
    if (inquiry.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(inquiry.gstNumber)) throw new ApiError(400, "Enter a valid GST number");
    const saved = await PartnerInquiry.create(inquiry);
    res.status(201).json({ success: true, message: "Your dealer inquiry has been received", data: { id: saved._id } });
  } catch (error) { next(error); }
});

router.get("/admin", protect, adminOnly, async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const filter = ["NEW", "READ", "RESOLVED"].includes(req.query.status) ? { status: req.query.status } : {};
    const [items, total] = await Promise.all([
      PartnerInquiry.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      PartnerInquiry.countDocuments(filter),
    ]);
    res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
});

router.patch("/admin/:id/status", protect, adminOnly, async (req, res, next) => {
  try {
    const status = String(req.body.status || "").toUpperCase();
    if (!["NEW", "READ", "RESOLVED"].includes(status)) throw new ApiError(400, "Invalid status");
    const item = await PartnerInquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!item) throw new ApiError(404, "Inquiry not found");
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
});

export default router;
