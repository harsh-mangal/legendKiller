import crypto from "crypto";
import mongoose from "mongoose";
import { ApiError } from "./apiError.js";

export const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
export const normalizePhone = (value) => String(value || "").replace(/\D/g, "").slice(-10);
export const normalizePincode = (value) => String(value || "").replace(/\D/g, "").slice(0, 6);
export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
export const isIndianPhone = (value) => /^[6-9][0-9]{9}$/.test(normalizePhone(value));
export const isIndianPincode = (value) => /^[1-9][0-9]{5}$/.test(normalizePincode(value));
export const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""));
export const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

export const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return ["true", "1", "yes", "on"].includes(String(value).toLowerCase());
};

export const parseNumber = (value, { name = "value", min = -Infinity, max = Infinity, integer = false, fallback } = {}) => {
  if ((value === undefined || value === null || value === "") && fallback !== undefined) return fallback;
  const number = Number(value);
  if (!Number.isFinite(number)) throw new ApiError(400, `${name} must be a valid number`);
  if (integer && !Number.isInteger(number)) throw new ApiError(400, `${name} must be a whole number`);
  if (number < min || number > max) throw new ApiError(400, `${name} must be between ${min} and ${max}`);
  return number;
};

export const parseArray = (value) => {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim()).filter(Boolean);
  } catch {}
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
};

export const makeSlug = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const validatePassword = (password) => {
  const value = String(password || "");
  if (value.length < 8) throw new ApiError(400, "Password must be at least 8 characters long");
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) throw new ApiError(400, "Password must contain at least one letter and one number");
  return value;
};

export const sanitizeShippingAddress = (address = {}) => {
  const sanitized = {
    fullName: String(address.fullName || "").trim(),
    phone: normalizePhone(address.phone),
    email: normalizeEmail(address.email),
    addressLine1: String(address.addressLine1 || "").trim(),
    addressLine2: String(address.addressLine2 || "").trim(),
    city: String(address.city || "").trim(),
    state: String(address.state || "").trim(),
    pincode: normalizePincode(address.pincode),
    country: "India",
  };
  const missing = ["fullName", "phone", "email", "addressLine1", "city", "state", "pincode"].filter((key) => !sanitized[key]);
  if (missing.length) throw new ApiError(400, `Shipping address is incomplete: ${missing.join(", ")}`);
  if (!isEmail(sanitized.email)) throw new ApiError(400, "A valid email address is required");
  if (!isIndianPhone(sanitized.phone)) throw new ApiError(400, "A valid 10-digit Indian mobile number is required");
  if (!isIndianPincode(sanitized.pincode)) throw new ApiError(400, "A valid 6-digit Indian pincode is required");
  return sanitized;
};
