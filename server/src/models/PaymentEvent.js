import mongoose from "mongoose";

const paymentEventSchema = new mongoose.Schema(
  {
    eventKey: { type: String, required: true, unique: true },
    eventType: { type: String, required: true },
    paymentId: String,
    razorpayOrderId: String,
    status: { type: String, enum: ["PROCESSING", "COMPLETED", "FAILED"], default: "PROCESSING" },
    error: String,
    processedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("PaymentEvent", paymentEventSchema);
