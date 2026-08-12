import mongoose from "mongoose";

const comboItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const comboSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    shortDescription: String,
    description: String,
    images: [String],
    products: [comboItemSchema],
    mrp: { type: Number, default: 0, min: 0 },
    price: { type: Number, required: true, min: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

comboSchema.virtual("availableStock").get(function () {
  if (!this.products?.length) return 0;
  return Math.min(
    ...this.products.map((item) => item.product?.isActive === false
      ? 0
      : Math.floor(Number(item.product?.stock || 0) / Math.max(1, Number(item.quantity || 1))))
  );
});

comboSchema.set("toJSON", { virtuals: true });
comboSchema.set("toObject", { virtuals: true });


comboSchema.pre("validate", function () {
  if (Number(this.mrp || 0) < Number(this.price || 0)) this.invalidate("mrp", "Combo MRP cannot be lower than the selling price");
});

export default mongoose.model("Combo", comboSchema);
