import mongoose from "mongoose";

const imageMetaSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    sizeKB: { type: Number, default: 0 },
    originalName: { type: String, default: "" },
    format: { type: String, default: "webp" },
  },
  { _id: false }
);

const bannerSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      enum: ["home", "categories"],
      required: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    mobileImage: {
      type: String,
      trim: true,
      default: "",
    },

    imageMeta: {
      type: imageMetaSchema,
      default: () => ({}),
    },

    mobileImageMeta: {
      type: imageMetaSchema,
      default: () => ({}),
    },

    recommendedSize: {
      desktop: { type: String, default: "" },
      mobile: { type: String, default: "" },
    },

    link: {
      type: String,
      trim: true,
      default: "",
    },

    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;