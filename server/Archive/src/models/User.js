import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    hasGuestOrdered: { type: Boolean, default: false },
    otpCode: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    lastLoginAt: Date,
    amyekaCoins: { type: Number, default: 0 },
    amyekaCoinHistory: [
      {
        type: { type: String, enum: ["EARNED", "REDEEMED", "REFUND", "ADJUSTMENT"] },
        coins: Number,
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        remark: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    addresses: [
      {
        fullName: String,
        phone: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "India" },
        isDefault: { type: Boolean, default: false },
      },
    ],
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
