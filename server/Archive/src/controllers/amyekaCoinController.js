import AmyekaCoinSetting from "../models/AmyekaCoinSetting.js";
import User from "../models/User.js";

export const getAmyekaCoinSetting = async (req, res) => {
  try {
    let setting = await AmyekaCoinSetting.findOne();

    if (!setting) {
      setting = await AmyekaCoinSetting.create({});
    }

    res.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAmyekaCoinSetting = async (req, res) => {
  try {
    let setting = await AmyekaCoinSetting.findOne();

    if (!setting) {
      setting = await AmyekaCoinSetting.create({});
    }

    const {
      earnEnabled,
      redeemEnabled,
      earnPercentage,
      coinValueInRupees,
      maxRedeemPercentage,
      applyOn,
    } = req.body;

    if (earnEnabled !== undefined) setting.earnEnabled = earnEnabled;
    if (redeemEnabled !== undefined) setting.redeemEnabled = redeemEnabled;
    if (earnPercentage !== undefined) setting.earnPercentage = Number(earnPercentage);
    if (coinValueInRupees !== undefined) setting.coinValueInRupees = Number(coinValueInRupees);
    if (maxRedeemPercentage !== undefined) setting.maxRedeemPercentage = Number(maxRedeemPercentage);
    if (applyOn) setting.applyOn = applyOn;

    await setting.save();

    res.json({
      success: true,
      message: "Amyeka Coin setting updated successfully",
      data: setting,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyAmyekaWallet = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId).select(
      "amyekaCoins amyekaCoinHistory"
    );

    res.json({
      success: true,
      data: {
        coins: user.amyekaCoins || 0,
        history: user.amyekaCoinHistory || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};