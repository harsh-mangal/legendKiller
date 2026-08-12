import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, trim: true },
    content: { type: String, required: true },
    coverImage: String,
    author: { type: String, default: "legendbornnutrition" },
    tags: [String],
    isPublished: { type: Boolean, default: true },
    publishedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
