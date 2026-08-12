import "../src/config/env.js";
import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import User from "../src/models/User.js";
import { isEmail, normalizeEmail, normalizePhone, validatePassword } from "../src/utils/validation.js";

const run = async () => {
  const name = String(process.env.ADMIN_NAME || "").trim();
  const email = normalizeEmail(process.env.ADMIN_EMAIL);
  const phone = normalizePhone(process.env.ADMIN_PHONE);
  const password = validatePassword(process.env.ADMIN_PASSWORD);
  if (!name || !isEmail(email)) throw new Error("Set a valid ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env");

  await connectDB();
  let user = await User.findOne({ email }).select("+password");
  if (user) {
    user.name = name;
    user.phone = phone || user.phone;
    user.role = "ADMIN";
    user.isBlocked = false;
    user.password = password;
    await user.save();
    console.log(`Updated admin ${email}`);
  } else {
    await User.create({ name, email, phone, password, role: "ADMIN" });
    console.log(`Created admin ${email}`);
  }
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close(false).catch(() => {});
  });
