import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    guestCheckout: { type: Boolean, default: false },
    guestContact: { name: String, email: String, phone: String },
    items: [
      {
        itemType: { type: String, enum: ["PRODUCT", "COMBO"], default: "PRODUCT" },
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
        combo: { type: mongoose.Schema.Types.ObjectId, ref: "Combo", default: null },
        comboProducts: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, quantity: Number, name: String }],
        name: String,
        image: String,
        price: Number,
        quantity: Number,
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
      country: String,
    },
    paymentMethod: { type: String, enum: ["COD", "ONLINE"], default: "COD" },
    paymentStatus: { type: String, enum: ["PENDING", "PROCESSING", "PAID", "FAILED"], default: "PENDING" },
    orderStatus: {
      type: String,
      enum: ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PLACED",
    },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    paidAt: { type: Date, default: null },
    amyekaCoinsUsed: { type: Number, default: 0 },
    amyekaDiscountAmount: { type: Number, default: 0 },
    amyekaCoinsRedeemedAt: { type: Date, default: null },
    amyekaCoinsEarned: { type: Number, default: 0 },
    stockRestoredAt: { type: Date, default: null },
    itemsPrice: Number,
    shippingPrice: Number,
    discount: { type: Number, default: 0 },
    totalPrice: Number,
  },
  { timestamps: true }
);

orderSchema.index({ razorpayOrderId: 1 });
orderSchema.index({ razorpayPaymentId: 1 });

export default mongoose.model("Order", orderSchema);
