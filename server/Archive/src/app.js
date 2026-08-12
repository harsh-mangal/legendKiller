import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import amyekaCoinRoutes from "./routes/amyekaCoinRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import comboRoutes from "./routes/comboRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import { getUsers } from "./controllers/adminController.js";
import { protect, adminOnly } from "./middleware/authMiddleware.js";
import { razorpayWebhook } from "./controllers/orderController.js";
import path from "path";

import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || "https://legendbornnutrition.com,http://localhost:3000,https://legendbornnutrition.com,https://www.legendbornnutrition.com,https://admin.legendbornnutrition.com").split(",").map((origin) => origin.trim()).filter(Boolean);

app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error("Origin not allowed by CORS"));
}, methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.post("/api/orders/razorpay/webhook", express.raw({ type: "application/json" }), razorpayWebhook);
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AmyekaVeda Ecommerce API running",
  });
});

app.use("/api/auth", authRoutes);
app.get("/api/admin/users-wallet-cart", protect, adminOnly, getUsers);
app.use("/api/banners", bannerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/amyeka-coins", amyekaCoinRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/combos", comboRoutes);
app.use("/api/contact", contactRoutes);
app.use(errorHandler);

export default app;
