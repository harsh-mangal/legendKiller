import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { otpTemplate, sendMail, welcomeTemplate } from "../utils/mailer.js";

const sendUserResponse = (res, user, message, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      amyekaCoins: user.amyekaCoins || 0,
      hasGuestOrdered: Boolean(user.hasGuestOrdered),
    },
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail });

    if (exists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password,
      role: "USER",
    });

    await sendMail({
      to: user.email,
      subject: "Welcome to Amyeka Veda",
      html: welcomeTemplate({ name: user.name }),
      text: `Welcome to Amyeka Veda, ${user.name}`,
    });

    sendUserResponse(res, user, "Registered successfully", 201);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: "Your account is blocked" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    sendUserResponse(res, user, "Login successful");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ success: false, message: "Account not found. Please register first." });
    if (user.isBlocked) return res.status(403).json({ success: false, message: "Your account is blocked" });

    const otp = String(crypto.randomInt(100000, 999999));
    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendMail({
      to: user.email,
      subject: "Your Amyeka Veda login OTP",
      html: otpTemplate({ name: user.name, otp }),
      text: `Your Amyeka Veda login OTP is ${otp}. It is valid for 10 minutes.`,
    });

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginWithOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+otpCode +otpExpiresAt");
    if (!user || !user.otpCode || user.otpCode !== String(otp)) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(401).json({ success: false, message: "OTP expired. Please request a new OTP." });
    }

    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    sendUserResponse(res, user, "OTP login successful");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};
