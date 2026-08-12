import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, trim: true, maxlength: 30 },
  subject: { type: String, trim: true, maxlength: 180 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  status: { type: String, enum: ["NEW", "READ", "RESOLVED"], default: "NEW" },
}, { timestamps: true });

export default mongoose.model("ContactMessage", contactMessageSchema);
