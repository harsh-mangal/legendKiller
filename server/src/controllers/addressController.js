import User from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { normalizePhone, normalizePincode } from "../utils/validation.js";

const sanitizeAddress = (value = {}) => {
  const address = {
    fullName: String(value.fullName || "").trim(),
    phone: normalizePhone(value.phone),
    addressLine1: String(value.addressLine1 || "").trim(),
    addressLine2: String(value.addressLine2 || "").trim(),
    city: String(value.city || "").trim(),
    state: String(value.state || "").trim(),
    pincode: normalizePincode(value.pincode),
    country: "India",
  };
  const missing = ["fullName", "phone", "addressLine1", "city", "state", "pincode"].filter((key) => !address[key]);
  if (missing.length) throw new ApiError(400, `Address is incomplete: ${missing.join(", ")}`);
  if (!/^[6-9][0-9]{9}$/.test(address.phone)) throw new ApiError(400, "Enter a valid 10-digit Indian mobile number");
  if (!/^[1-9][0-9]{5}$/.test(address.pincode)) throw new ApiError(400, "Enter a valid 6-digit Indian pincode");
  return address;
};

export const listAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("addresses");
    res.json({ success: true, data: user?.addresses || [] });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");
    if (user.addresses.length >= 10) throw new ApiError(400, "You can save up to 10 delivery addresses");
    const address = sanitizeAddress(req.body);
    const makeDefault = req.body.isDefault === true || req.body.isDefault === "true" || user.addresses.length === 0;
    if (makeDefault) user.addresses.forEach((item) => { item.isDefault = false; });
    user.addresses.push({ ...address, isDefault: makeDefault });
    await user.save();
    res.status(201).json({ success: true, message: "Address saved", data: user.addresses.at(-1) });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");
    const address = user.addresses.id(req.params.id);
    if (!address) throw new ApiError(404, "Address not found");
    Object.assign(address, sanitizeAddress({ ...address.toObject(), ...req.body }));
    if (req.body.isDefault === true || req.body.isDefault === "true") {
      user.addresses.forEach((item) => { item.isDefault = String(item._id) === String(address._id); });
    }
    await user.save();
    res.json({ success: true, message: "Address updated", data: address });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");
    const address = user.addresses.id(req.params.id);
    if (!address) throw new ApiError(404, "Address not found");
    const wasDefault = address.isDefault;
    address.deleteOne();
    if (wasDefault && user.addresses.length) user.addresses[0].isDefault = true;
    await user.save();
    res.json({ success: true, message: "Address deleted" });
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");
    const target = user.addresses.id(req.params.id);
    if (!target) throw new ApiError(404, "Address not found");
    user.addresses.forEach((item) => { item.isDefault = String(item._id) === String(target._id); });
    await user.save();
    res.json({ success: true, message: "Default address updated", data: target });
  } catch (error) {
    next(error);
  }
};
