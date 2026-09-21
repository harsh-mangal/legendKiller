import mongoose from "mongoose";

const patentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 2000 },
  fileUrl: { type: String, required: true },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Patent", patentSchema);
