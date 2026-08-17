import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, trim: true },
    content: { type: String, required: true },
    coverImage: { type: String, default: "" },
    imageAlt: { type: String, trim: true, default: "" },
    author: { type: String, default: "Legend Born Research Team", trim: true },
    category: { type: String, default: "Sports Nutrition", trim: true },
    tags: [String],
    focusKeyword: { type: String, trim: true, default: "" },
    secondaryKeywords: [String],
    metaTitle: { type: String, trim: true, default: "" },
    metaDescription: { type: String, trim: true, default: "" },
    canonicalUrl: { type: String, trim: true, default: "" },
    readTimeMinutes: { type: Number, default: 4 },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    publishedAt: Date,
  },
  { timestamps: true }
);

blogSchema.index({ slug: 1, isPublished: 1 });
blogSchema.index({ focusKeyword: 1 });
blogSchema.index({ category: 1 });

export default mongoose.model("Blog", blogSchema);
