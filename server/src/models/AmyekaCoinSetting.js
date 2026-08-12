import mongoose from "mongoose";

const amyekaCoinSettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true, immutable: true },
    earnEnabled: { type: Boolean, default: true },
    redeemEnabled: { type: Boolean, default: true },

    // Example: 5 means user earns 5% coins on order/cart value
    earnPercentage: { type: Number, default: 5 },

    // Example: 1 coin = ₹1
    coinValueInRupees: { type: Number, default: 1 },

    // Maximum cart amount user can pay using coins
    maxRedeemPercentage: { type: Number, default: 20 },

    applyOn: {
      type: String,
      enum: ["CART_VALUE", "ORDER_VALUE"],
      default: "ORDER_VALUE",
    },
  },
  { timestamps: true }
);

export default mongoose.model("AmyekaCoinSetting", amyekaCoinSettingSchema);