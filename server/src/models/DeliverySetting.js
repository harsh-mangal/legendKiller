import mongoose from "mongoose";

const deliverySettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true, immutable: true },
    serviceAllIndia: { type: Boolean, default: true },
    serviceablePincodes: [{ type: String, trim: true }],
    excludedPincodes: [{ type: String, trim: true }],
    codEnabled: { type: Boolean, default: true },
    onlinePaymentEnabled: { type: Boolean, default: true },
    shippingFee: { type: Number, default: 80, min: 0 },
    freeShippingThreshold: { type: Number, default: 999, min: 0 },
    estimatedDaysMin: { type: Number, default: 3, min: 1 },
    estimatedDaysMax: { type: Number, default: 7, min: 1 },
  },
  { timestamps: true }
);

export default mongoose.model("DeliverySetting", deliverySettingSchema);
