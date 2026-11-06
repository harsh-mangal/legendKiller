import StorefrontSetting from "../models/StorefrontSetting.js";
import { deleteUploadedImages, uploadMultipleImages } from "../utils/imageUpload.js";
import { parseBoolean } from "../utils/validation.js";

export const getArticleSettings = async (req, res, next) => {
  try {
    const setting = await StorefrontSetting.findOne({ key: "articles" }).lean();
    res.set("Cache-Control", "no-store");
    res.json({ success: true, data: { aboutLegendSlayerBanner: setting?.aboutLegendSlayerBanner || "" } });
  } catch (error) { next(error); }
};

export const updateArticleSettings = async (req, res, next) => {
  try {
    const setting = await StorefrontSetting.findOne({ key: "articles" });
    const previous = setting?.aboutLegendSlayerBanner || "";
    let banner = previous;
    if (req.file) {
      [banner] = await uploadMultipleImages([req.file], "article-banners", { width: 1920, quality: 90, maxBytes: 900 * 1024 });
    } else if (parseBoolean(req.body.clearBanner)) {
      banner = "";
    }
    await StorefrontSetting.findOneAndUpdate(
      { key: "articles" },
      { $set: { aboutLegendSlayerBanner: banner } },
      { upsert: true, runValidators: true }
    );
    if (previous && previous !== banner) await deleteUploadedImages([previous]);
    res.json({ success: true, data: { aboutLegendSlayerBanner: banner } });
  } catch (error) { next(error); }
};

export const getHomepageSettings = async (req, res, next) => {
  try {
    const setting = await StorefrontSetting.findOne({ key: "homepage" }).lean();
    res.set("Cache-Control", "no-store");
    res.json({ success: true, data: { shopMoreTogetherActive: setting?.shopMoreTogetherActive !== false } });
  } catch (error) {
    next(error);
  }
};

export const updateHomepageSettings = async (req, res, next) => {
  try {
    const { shopMoreTogetherActive } = req.body;
    if (typeof shopMoreTogetherActive !== "boolean") {
      return res.status(400).json({ success: false, message: "shopMoreTogetherActive must be a boolean" });
    }
    const setting = await StorefrontSetting.findOneAndUpdate(
      { key: "homepage" },
      { $set: { shopMoreTogetherActive } },
      { returnDocument: "after", upsert: true, runValidators: true }
    );
    return res.json({ success: true, data: { shopMoreTogetherActive: setting.shopMoreTogetherActive } });
  } catch (error) {
    next(error);
  }
};
