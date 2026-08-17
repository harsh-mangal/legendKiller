import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    isApproved: { type: Boolean, default: false },
    isVerifiedPurchase: { type: Boolean, default: false },
    media: [{ type: { type: String, enum: ["image", "video"] }, url: String }],
  },
  { timestamps: true }
);

const infographicSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    altText: { type: String, trim: true, maxlength: 240 },
    caption: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const productVideoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    title: { type: String, trim: true, maxlength: 180 },
    caption: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, trim: true, uppercase: true, unique: true, sparse: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    shortDescription: { type: String, trim: true, maxlength: 500 },
    description: { type: String, required: true, trim: true },
    longDescription: { type: String, trim: true },
    benefits: [String],
    ingredients: [String],
    howToUse: { type: String, trim: true },
    suitableFor: [String],
    warnings: [String],
    storageInstructions: { type: String, trim: true },
    legalDisclaimer: { type: String, trim: true },
    manufacturerName: { type: String, trim: true },
    marketerName: { type: String, trim: true },
    countryOfOrigin: { type: String, trim: true, default: "India" },
    licenceType: { type: String, trim: true },
    licenceNumber: { type: String, trim: true },
    hsnCode: { type: String, trim: true },
    gstRate: { type: Number, min: 0, max: 100, default: 0 },
    vegetarian: { type: Boolean, default: null },
    batchTrackingEnabled: { type: Boolean, default: false },
    expiryTrackingEnabled: { type: Boolean, default: false },
    seoTitle: { type: String, trim: true, maxlength: 70 },
    seoDescription: { type: String, trim: true, maxlength: 180 },
    images: [String],
    infographics: [infographicSchema],
    videos: [productVideoSchema],
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    unit: { type: String, default: "Pack", trim: true },
    weight: { type: String, trim: true },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    reviews: [reviewSchema],
    isActive: { type: Boolean, default: true },
    authenticityCode: { type: String, uppercase: true, trim: true, unique: true, sparse: true },
    verificationCount: { type: Number, default: 0, min: 0 },
    lastVerifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

productSchema.pre("validate", function () {
  if (Number(this.mrp) < Number(this.price)) {
    this.invalidate("mrp", "MRP cannot be lower than the selling price");
  }
  if (!this.authenticityCode) {
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const slugPrefix = (this.slug || "LK").replace(/[^A-Z0-9]/gi, "").substring(0, 8).toUpperCase();
    this.authenticityCode = `LK-AUTH-${slugPrefix}-${randomSuffix}`;
  }
});

productSchema.index({ name: "text", shortDescription: "text", description: "text", ingredients: "text" });
productSchema.index({ category: 1, isActive: 1, createdAt: -1 });

export default mongoose.model("Product", productSchema);
