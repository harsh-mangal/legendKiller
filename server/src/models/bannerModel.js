import mongoose from "mongoose";

const imageMetaSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    sizeKB: { type: Number, default: 0 },
    originalName: { type: String, default: "" },
    format: { type: String, default: "webp" },
    mediaType: { type: String, enum: ["image", "video"], default: "image" },
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

    mediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },

    mobileMediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
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
      desktop: { type: String, default: "1920 x 350 px" },
      mobile: { type: String, default: "750 x 350 px" },
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