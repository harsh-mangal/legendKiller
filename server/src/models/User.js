import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 10 },
    addressLine1: { type: String, required: true, trim: true, maxlength: 250 },
    addressLine2: { type: String, trim: true, maxlength: 250, default: "" },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    pincode: { type: String, required: true, trim: true, match: /^[1-9][0-9]{5}$/ },
    country: { type: String, default: "India", trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const coinHistorySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["EARNED", "REDEEMED", "REFUND", "ADJUSTMENT"], required: true },
    coins: { type: Number, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    remark: { type: String, trim: true, maxlength: 250 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 10 },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    hasGuestOrdered: { type: Boolean, default: false }, // legacy guest-account migration flag
    emailVerifiedAt: { type: Date, default: null },
    otpHash: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    otpSentAt: { type: Date, select: false },
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpiresAt: { type: Date, select: false },
    passwordChangedAt: { type: Date, default: null },
    lastLoginAt: Date,
    amyekaCoins: { type: Number, default: 0, min: 0 },
    amyekaCoinDebt: { type: Number, default: 0, min: 0, select: false },
    amyekaCoinHistory: [coinHistorySchema],
    addresses: [addressSchema],
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ phone: 1 }, { sparse: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  if (!this.isNew) this.passwordChangedAt = new Date();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
