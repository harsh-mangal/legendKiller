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

const normalizePromotionPayload = (body = {}) => {
  const code = String(body.code || "").trim().toUpperCase();
  if (!code) throw new ApiError(400, "Coupon code is required");
  const discountType = String(body.discountType || "").toUpperCase();
  if (!["PERCENTAGE", "FIXED"].includes(discountType)) throw new ApiError(400, "Discount type must be PERCENTAGE or FIXED");
  const discountValue = Number(body.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) throw new ApiError(400, "Discount value must be greater than zero");
  if (discountType === "PERCENTAGE" && discountValue > 100) throw new ApiError(400, "Percentage discount cannot exceed 100");
  return {
    code,
    description: String(body.description || "").trim(),
    discountType,
    discountValue,
    maxDiscount: body.maxDiscount === "" || body.maxDiscount == null ? null : Number(body.maxDiscount),
    minOrderValue: Number(body.minOrderValue || 0),
    startsAt: body.startsAt || null,
    endsAt: body.endsAt || null,
    usageLimit: body.usageLimit === "" || body.usageLimit == null ? null : Number(body.usageLimit),
    perUserLimit: Number(body.perUserLimit || 1),
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
