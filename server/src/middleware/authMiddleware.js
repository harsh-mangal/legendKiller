import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/apiError.js";

const readToken = (req) => {
  const value = String(req.headers.authorization || "");
  return value.startsWith("Bearer ") ? value.slice(7).trim() : "";
};

const resolveUser = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId).select("-password -otpHash -resetPasswordTokenHash");
  if (!user) throw new ApiError(401, "User not found");
  if (user.isBlocked) throw new ApiError(403, "Account blocked");
  if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
    throw new ApiError(401, "Session expired. Please log in again");
  }
  return user;
};

export const protect = async (req, res, next) => {
  try {
    const token = readToken(req);
    if (!token) throw new ApiError(401, "Please log in to continue");
    req.user = await resolveUser(token);
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Session is invalid or expired"));
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = readToken(req);
    if (token) req.user = await resolveUser(token);
    next();
  } catch {
    req.user = null;
    next();
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role === "ADMIN") return next();
  next(new ApiError(403, "Admin access only"));
};
