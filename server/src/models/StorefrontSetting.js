import mongoose from "mongoose";

const storefrontSettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "homepage", unique: true, immutable: true },
    shopMoreTogetherActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("StorefrontSetting", storefrontSettingSchema);
