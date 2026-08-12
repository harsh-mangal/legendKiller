import mongoose from "mongoose";

const rateLimitBucketSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);
rateLimitBucketSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model("RateLimitBucket", rateLimitBucketSchema);
