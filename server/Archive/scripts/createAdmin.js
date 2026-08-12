import dotenv from "dotenv";
import connectDB from "../src/config/db.js";
import User from "../src/models/User.js";

dotenv.config();

const run = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in server/.env");
  await connectDB();
  const email = ADMIN_EMAIL.toLowerCase().trim();
  let user = await User.findOne({ email }).select("+password");
  if (user) {
    user.name = ADMIN_NAME;
    user.role = "ADMIN";
    user.password = ADMIN_PASSWORD;
    await user.save();
    console.log(`Updated admin ${email}`);
  } else {
    await User.create({ name: ADMIN_NAME, email, password: ADMIN_PASSWORD, role: "ADMIN" });
    console.log(`Created admin ${email}`);
  }
  process.exit(0);
};

run().catch((error) => { console.error(error.message); process.exit(1); });
