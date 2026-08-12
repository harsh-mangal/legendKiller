import crypto from "crypto";
import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, trim: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const returnRequestSchema = new mongoose.Schema(
  {
    reason: { type: String, required: true, trim: true, maxlength: 1000 },
    type: { type: String, enum: ["RETURN", "REPLACEMENT", "REFUND"], default: "RETURN" },
    status: { type: String, enum: ["REQUESTED", "APPROVED", "REJECTED", "COMPLETED"], default: "REQUESTED" },
    requestedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },
    adminNote: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: false }
);

const orderSchema = new mongoose.Schema(
  {
    publicOrderNumber: {
      type: String,
      unique: true,
      default: () => `AV-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
      index: true,
    },
    invoiceNumber: { type: String, unique: true, sparse: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    guestCheckout: { type: Boolean, default: false },
    guestContact: {
      name: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
    },
    items: [
      {
        itemType: { type: String, enum: ["PRODUCT", "COMBO"], default: "PRODUCT" },
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
        combo: { type: mongoose.Schema.Types.ObjectId, ref: "Combo", default: null },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
        comboProducts: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, quantity: Number, name: String }],
        name: String,
        image: String,
        sku: String,
        hsnCode: String,
        gstRate: { type: Number, default: 0 },
        price: { type: Number, min: 0 },
        mrp: { type: Number, min: 0 },
        quantity: { type: Number, min: 1 },
        totalPrice: { type: Number, min: 0 },
      },
    ],
    shippingAddress: {
      fullName: String,
      phone: String,
      email: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },
    paymentMethod: { type: String, enum: ["COD", "ONLINE"], default: "COD" },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PROCESSING", "PAID", "FAILED", "CANCELLED", "REFUND_PENDING", "REFUNDED"],
      default: "PENDING",
    },
    paymentError: { type: String, default: "" },
    paymentProcessingStartedAt: { type: Date, default: null },
    orderStatus: {
      type: String,
      enum: ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURN_REQUESTED", "RETURNED"],
      default: "PLACED",
    },
    statusHistory: [statusHistorySchema],
    razorpayOrderId: { type: String, default: undefined },
    razorpayPaymentId: { type: String, default: undefined },
    razorpaySignature: { type: String, default: undefined, select: false },
    paidAt: { type: Date, default: null },
    refundId: { type: String, default: undefined },
    refundedAt: { type: Date, default: null },
    refundAmount: { type: Number, default: 0 },
    amyekaCoinsUsed: { type: Number, default: 0 },
    amyekaDiscountAmount: { type: Number, default: 0 },
    amyekaCoinsRedeemedAt: { type: Date, default: null },
    amyekaCoinsEarned: { type: Number, default: 0 },
    amyekaCoinsCredited: { type: Number, default: 0 },
    amyekaCoinDebtOffset: { type: Number, default: 0 },
    amyekaCoinsReversed: { type: Number, default: 0 },
    amyekaCoinDebtCreated: { type: Number, default: 0 },
    couponCode: { type: String, uppercase: true, trim: true, default: "" },
    couponDiscountAmount: { type: Number, default: 0 },
    promotion: { type: mongoose.Schema.Types.ObjectId, ref: "Promotion", default: null },
    stockReservationStatus: { type: String, enum: ["NONE", "RESERVED", "COMMITTED", "RELEASED"], default: "NONE" },
    stockReservedAt: { type: Date, default: null },
    reservationExpiresAt: { type: Date, default: null, index: true },
    stockReleasedAt: { type: Date, default: null },
    cancellation: {
      requestedAt: Date,
      requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      reason: String,
      status: { type: String, enum: ["NONE", "REQUESTED", "APPROVED", "REJECTED"], default: "NONE" },
      resolvedAt: Date,
      adminNote: String,
    },
    returnRequests: [returnRequestSchema],
    tracking: {
      courierName: String,
      trackingNumber: String,
      trackingUrl: String,
      shippedAt: Date,
      deliveredAt: Date,
    },
    itemsPrice: { type: Number, min: 0, required: true },
    shippingPrice: { type: Number, min: 0, default: 0 },
    discount: { type: Number, min: 0, default: 0 },
    taxPrice: { type: Number, min: 0, default: 0 },
    totalPrice: { type: Number, min: 0, required: true },
  },
  { timestamps: true }
);

orderSchema.index({ razorpayOrderId: 1 }, { sparse: true });
orderSchema.index({ razorpayPaymentId: 1 }, { sparse: true });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "guestContact.email": 1, createdAt: -1 });
orderSchema.index({ "guestContact.phone": 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, paymentStatus: 1, createdAt: -1 });

orderSchema.pre("save", function () {
  if (!this.statusHistory?.length) {
    this.statusHistory = [{ status: this.orderStatus || "PLACED", note: "Order created" }];
  }
});

export default mongoose.model("Order", orderSchema);
