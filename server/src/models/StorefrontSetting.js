import mongoose from "mongoose";

const storefrontSettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "homepage", unique: true, immutable: true },
    shopMoreTogetherActive: { type: Boolean, default: true },
    aboutLegendSlayerBanner: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("StorefrontSetting", storefrontSettingSchema);
