import StorefrontSetting from "../models/StorefrontSetting.js";

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
