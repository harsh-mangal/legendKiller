import DeliverySetting from "../models/DeliverySetting.js";
import { checkDeliveryAvailability, getDeliverySetting } from "../services/commerceService.js";

export const checkDelivery = async (req, res, next) => {
  try {
    const result = await checkDeliveryAvailability(req.query.pincode);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getDeliverySettings = async (req, res, next) => {
  try {
    res.json({ success: true, data: await getDeliverySetting() });
  } catch (error) {
    next(error);
  }
};

export const updateDeliverySettings = async (req, res, next) => {
  try {
    const update = {
      serviceAllIndia: req.body.serviceAllIndia !== false && req.body.serviceAllIndia !== "false",
      serviceablePincodes: Array.isArray(req.body.serviceablePincodes) ? req.body.serviceablePincodes : [],
      excludedPincodes: Array.isArray(req.body.excludedPincodes) ? req.body.excludedPincodes : [],
      codEnabled: req.body.codEnabled !== false && req.body.codEnabled !== "false",
      onlinePaymentEnabled: req.body.onlinePaymentEnabled !== false && req.body.onlinePaymentEnabled !== "false",
      shippingFee: Math.max(0, Number(req.body.shippingFee || 0)),
      freeShippingThreshold: Math.max(0, Number(req.body.freeShippingThreshold || 0)),
      estimatedDaysMin: Math.max(1, Number(req.body.estimatedDaysMin || 3)),
      estimatedDaysMax: Math.max(1, Number(req.body.estimatedDaysMax || 7)),
    };
    if (update.estimatedDaysMax < update.estimatedDaysMin) update.estimatedDaysMax = update.estimatedDaysMin;
    const setting = await DeliverySetting.findOneAndUpdate({ key: "default" }, { ...update, key: "default" }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.json({ success: true, message: "Delivery settings updated", data: setting });
  } catch (error) {
    next(error);
  }
};
