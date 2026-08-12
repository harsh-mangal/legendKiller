import AmyekaCoinSetting from "../models/AmyekaCoinSetting.js";
import User from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { parseBoolean, parseNumber } from "../utils/validation.js";

const getOrCreate = () => AmyekaCoinSetting.findOneAndUpdate({ key: "default" }, { $setOnInsert: { key: "default" } }, { upsert: true, new: true, setDefaultsOnInsert: true });

export const getAmyekaCoinSetting = async (req, res, next) => {
  try { res.json({ success: true, data: await getOrCreate() }); } catch (error) { next(error); }
};

export const updateAmyekaCoinSetting = async (req, res, next) => {
  try {
    const setting = await getOrCreate();
    if (req.body.earnEnabled !== undefined) setting.earnEnabled = parseBoolean(req.body.earnEnabled);
    if (req.body.redeemEnabled !== undefined) setting.redeemEnabled = parseBoolean(req.body.redeemEnabled);
    if (req.body.earnPercentage !== undefined) setting.earnPercentage = parseNumber(req.body.earnPercentage, { name: "Earn percentage", min: 0, max: 100 });
    if (req.body.coinValueInRupees !== undefined) setting.coinValueInRupees = parseNumber(req.body.coinValueInRupees, { name: "Coin value", min: 0.01, max: 1000 });
    if (req.body.maxRedeemPercentage !== undefined) setting.maxRedeemPercentage = parseNumber(req.body.maxRedeemPercentage, { name: "Maximum redeem percentage", min: 0, max: 100 });
    if (req.body.applyOn !== undefined) {
      const applyOn = String(req.body.applyOn).toUpperCase();
      if (!["CART_VALUE", "ORDER_VALUE"].includes(applyOn)) throw new ApiError(400, "Invalid coin application basis");
      setting.applyOn = applyOn;
    }
    await setting.save();
    res.json({ success: true, message: "Ameyka Coin settings updated", data: setting });
  } catch (error) { next(error); }
};

export const getMyAmyekaWallet = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("amyekaCoins amyekaCoinHistory");
    if (!user) throw new ApiError(404, "User not found");
    res.json({ success: true, data: { coins: user.amyekaCoins || 0, history: (user.amyekaCoinHistory || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) } });
  } catch (error) { next(error); }
};
