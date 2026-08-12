import crypto from "crypto";
import User from "../models/User.js";
import { env } from "../config/env.js";
import generateToken from "../utils/generateToken.js";
import { ApiError } from "../utils/apiError.js";
import { isEmail, isIndianPhone, normalizeEmail, normalizePhone, sha256, validatePassword } from "../utils/validation.js";
import { otpTemplate, passwordResetTemplate, sendMail, welcomeTemplate } from "../utils/mailer.js";

const publicUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  role: user.role,
  amyekaCoins: Number(user.amyekaCoins || 0),
  addresses: user.addresses || [],
  lastLoginAt: user.lastLoginAt || null,
});

const sendUserResponse = (res, user, message, statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, token: generateToken(user._id), user: publicUser(user) });
};

const sendMailSafely = (payload) => sendMail(payload).catch((error) => {
  console.error("Email delivery failed:", error.message);
});

export const registerUser = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const phone = normalizePhone(req.body.phone);
    const password = validatePassword(req.body.password);
    if (!name || !email) throw new ApiError(400, "Name, email and password are required");
    if (!isEmail(email)) throw new ApiError(400, "Enter a valid email address");
    if (phone && !isIndianPhone(phone)) throw new ApiError(400, "Enter a valid 10-digit Indian mobile number");

    const existing = await User.findOne({ email }).select("+password");
    let user;
    if (existing) {
      if (!existing.hasGuestOrdered) throw new ApiError(409, "An account with this email already exists");
      existing.name = name;
      existing.phone = phone;
      existing.password = password;
      existing.hasGuestOrdered = false;
      existing.isBlocked = false;
      user = await existing.save();
    } else {
      user = await User.create({ name, email, phone, password, role: "USER" });
    }

    sendMailSafely({
      to: user.email,
      subject: "Welcome to Ameyka Veda",
      html: welcomeTemplate({ name: user.name }),
      text: `Welcome to Ameyka Veda, ${user.name}`,
    });
    sendUserResponse(res, user, "Registered successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    if (!email || !password) throw new ApiError(400, "Email and password are required");
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) throw new ApiError(401, "Invalid email or password");
    if (user.isBlocked) throw new ApiError(403, "Your account is blocked");
    user.lastLoginAt = new Date();
    await user.save();
    sendUserResponse(res, user, "Login successful");
  } catch (error) {
    next(error);
  }
};

export const requestLoginOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) throw new ApiError(400, "Email is required");
    const user = await User.findOne({ email }).select("+otpHash +otpExpiresAt +otpAttempts +otpSentAt");
    const generic = { success: true, message: "If an eligible account exists, an OTP has been sent." };
    if (!user || user.isBlocked) return res.json(generic);
    if (user.otpSentAt && Date.now() - user.otpSentAt.getTime() < 60_000) return res.json(generic);

    const otp = String(crypto.randomInt(100000, 1000000));
    user.otpHash = sha256(`${otp}:${process.env.JWT_SECRET}`);
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts = 0;
    user.otpSentAt = new Date();
    await user.save();

    await sendMailSafely({
      to: user.email,
      subject: "Your Ameyka Veda login OTP",
      html: otpTemplate({ name: user.name, otp }),
      text: `Your Ameyka Veda login OTP is ${otp}. It is valid for 10 minutes.`,
    });
    res.json(generic);
  } catch (error) {
    next(error);
  }
};

export const loginWithOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    if (!email || !/^\d{6}$/.test(otp)) throw new ApiError(400, "Email and a valid 6-digit OTP are required");
    const user = await User.findOne({ email }).select("+otpHash +otpExpiresAt +otpAttempts +otpSentAt");
    if (!user || user.isBlocked || !user.otpHash || !user.otpExpiresAt) throw new ApiError(401, "Invalid or expired OTP");
    if (user.otpExpiresAt < new Date()) throw new ApiError(401, "OTP expired. Please request a new OTP");
    if (Number(user.otpAttempts || 0) >= 5) throw new ApiError(429, "Too many incorrect OTP attempts. Request a new OTP");
    const valid = crypto.timingSafeEqual(Buffer.from(user.otpHash), Buffer.from(sha256(`${otp}:${process.env.JWT_SECRET}`)));
    if (!valid) {
      user.otpAttempts = Number(user.otpAttempts || 0) + 1;
      await user.save();
      throw new ApiError(401, "Invalid or expired OTP");
    }
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    user.otpSentAt = undefined;
    user.lastLoginAt = new Date();
    user.emailVerifiedAt = user.emailVerifiedAt || new Date();
    await user.save();
    sendUserResponse(res, user, "OTP login successful");
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) throw new ApiError(400, "Email is required");
    const user = await User.findOne({ email }).select("+resetPasswordTokenHash +resetPasswordExpiresAt");
    if (user && !user.isBlocked) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordTokenHash = sha256(rawToken);
      user.resetPasswordExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
      const resetUrl = `${env.frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
      await sendMailSafely({
        to: user.email,
        subject: "Reset your Ameyka Veda password",
        html: passwordResetTemplate({ name: user.name, resetUrl }),
        text: `Reset your password using this link: ${resetUrl}. The link is valid for 30 minutes.`,
      });
    }
    res.json({ success: true, message: "If an account exists, reset instructions have been sent." });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const token = String(req.body.token || "");
    const password = validatePassword(req.body.password);
    if (!token) throw new ApiError(400, "Reset token is required");
    const user = await User.findOne({
      resetPasswordTokenHash: sha256(token),
      resetPasswordExpiresAt: { $gt: new Date() },
      isBlocked: false,
    }).select("+resetPasswordTokenHash +resetPasswordExpiresAt +password");
    if (!user) throw new ApiError(400, "The reset link is invalid or has expired");
    user.password = password;
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res) => {
  res.json({ success: true, user: publicUser(req.user), data: publicUser(req.user) });
};
