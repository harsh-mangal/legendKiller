import Promotion from "../models/Promotion.js";
import { ApiError } from "../utils/apiError.js";
import { buildOrderItems, evaluatePromotion } from "../services/commerceService.js";

export const validatePromotion = async (req, res, next) => {
  try {
    const { orderItems, itemsPrice } = await buildOrderItems(req.body.items || []);
    const result = await evaluatePromotion({ code: req.body.code, orderItems, itemsPrice, userId: req.user?._id || null });
    res.json({
      success: true,
      data: {
        valid: true,
        code: result.code,
        discountAmount: result.discountAmount,
        message: `Coupon ${result.code} applied successfully.`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listPromotions = async (req, res, next) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    res.json({ success: true, data: promotions });
  } catch (error) {
    next(error);
  }
};

export const normalizePromotionPayload = (body = {}) => {
  const code = String(body.code || "").trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) throw new ApiError(400, "Coupon code must use 3-32 letters, numbers, hyphens or underscores");
  const discountType = String(body.discountType || "").toUpperCase();
  if (!["PERCENTAGE", "FIXED"].includes(discountType)) throw new ApiError(400, "Discount type must be PERCENTAGE or FIXED");
  const discountValue = Number(body.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) throw new ApiError(400, "Discount value must be greater than zero");
  if (discountType === "PERCENTAGE" && discountValue > 100) throw new ApiError(400, "Percentage discount cannot exceed 100");
  const maxDiscount = body.maxDiscount === "" || body.maxDiscount == null ? null : Number(body.maxDiscount);
  const minOrderValue = Number(body.minOrderValue || 0);
  const usageLimit = body.usageLimit === "" || body.usageLimit == null ? null : Number(body.usageLimit);
  const perUserLimit = Number(body.perUserLimit || 1);
  const startsAt = body.startsAt ? new Date(body.startsAt) : null;
  const endsAt = body.endsAt ? new Date(body.endsAt) : null;
  if (maxDiscount !== null && (!Number.isFinite(maxDiscount) || maxDiscount < 0)) throw new ApiError(400, "Maximum discount cannot be negative");
  if (!Number.isFinite(minOrderValue) || minOrderValue < 0) throw new ApiError(400, "Minimum order value cannot be negative");
  if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 1)) throw new ApiError(400, "Usage limit must be a positive whole number");
  if (!Number.isInteger(perUserLimit) || perUserLimit < 1) throw new ApiError(400, "Per-customer limit must be a positive whole number");
  if (usageLimit !== null && perUserLimit > usageLimit) throw new ApiError(400, "Per-customer limit cannot exceed the total usage limit");
  if (startsAt && Number.isNaN(startsAt.getTime())) throw new ApiError(400, "Coupon start date is invalid");
  if (endsAt && Number.isNaN(endsAt.getTime())) throw new ApiError(400, "Coupon end date is invalid");
  if (startsAt && endsAt && endsAt < startsAt) throw new ApiError(400, "Coupon end date cannot be before its start date");
  return {
    code,
    description: String(body.description || "").trim(),
    discountType,
    discountValue,
    maxDiscount,
    minOrderValue,
    startsAt,
    endsAt,
    usageLimit,
    perUserLimit,
    eligibleProducts: Array.isArray(body.eligibleProducts) ? body.eligibleProducts : [],
    eligibleCategories: Array.isArray(body.eligibleCategories) ? body.eligibleCategories : [],
    isActive: body.isActive !== false && body.isActive !== "false",
  };
};

export const createPromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.create(normalizePromotionPayload(req.body));
    res.status(201).json({ success: true, message: "Coupon created", data: promotion });
  } catch (error) {
    next(error);
  }
};

export const updatePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) throw new ApiError(404, "Coupon not found");
    Object.assign(promotion, normalizePromotionPayload({ ...promotion.toObject(), ...req.body }));
    await promotion.save();
    res.json({ success: true, message: "Coupon updated", data: promotion });
  } catch (error) {
    next(error);
  }
};

export const deletePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!promotion) throw new ApiError(404, "Coupon not found");
    res.json({ success: true, message: "Coupon disabled", data: promotion });
  } catch (error) {
    next(error);
  }
};
