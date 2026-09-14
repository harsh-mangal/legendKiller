import mongoose from "mongoose";

const pillarSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredient: { type: String, default: "" },
  role: { type: String, default: "" },
});

const chapterSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
});

const architectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    subtitle: { type: String, default: "" },
    category: { type: String, default: "Viper Protocol" },
    badge: { type: String, default: "5 Pillars" },
    icon: { type: String, default: "Zap" },
    shortDescription: { type: String, default: "" },
    overview: { type: String, default: "" },
    pillars: [pillarSchema],
    emergentOutcomes: [{ type: String }],
    chapters: [chapterSchema],
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Architecture = mongoose.model("Architecture", architectureSchema);
export default Architecture;
