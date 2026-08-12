import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 250 },
    discountType: { type: String, enum: ["PERCENTAGE", "FIXED"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, min: 0, default: null },
    minOrderValue: { type: Number, min: 0, default: 0 },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    usageLimit: { type: Number, min: 0, default: null },
    usageCount: { type: Number, min: 0, default: 0 },
    perUserLimit: { type: Number, min: 1, default: 1 },
    usedBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, usedAt: { type: Date, default: Date.now } }],
    eligibleProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    eligibleCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

promotionSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 });

export default mongoose.model("Promotion", promotionSchema);
