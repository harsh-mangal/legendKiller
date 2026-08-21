import "./config/env.js";
import path from "path";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import addressRoutes from "./routes/addressRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import comboRoutes from "./routes/comboRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import amyekaCoinRoutes from "./routes/amyekaCoinRoutes.js";
import sitemapRoutes from "./routes/sitemapRoutes.js";
import { getDashboardSummary, getUsers, updateUserBlockStatus } from "./controllers/adminController.js";
import { razorpayWebhook } from "./controllers/orderController.js";
import { adminOnly, protect } from "./middleware/authMiddleware.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { requestContext, securityHeaders } from "./middleware/securityMiddleware.js";


const app = express();
app.disable("x-powered-by");
app.set("trust proxy", Number(process.env.TRUST_PROXY || 1));
app.use(requestContext);
app.use(securityHeaders);

const allowedOrigins = (process.env.CORS_ORIGIN || "https://legendbornnutrition.com,https://www.legendbornnutrition.com,https://admin.legendbornnutrition.com,https://legendkiller.com,https://www.legendkiller.com,https://admin.legendkiller.com,http://localhost:3000,http://localhost:5173")
  .split(",").map((origin) => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(Object.assign(new Error("Origin not allowed by CORS"), { statusCode: 403 }));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  exposedHeaders: ["X-Request-ID", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
  maxAge: 86400,
}));

// Razorpay requires the unmodified request body for signature verification.
app.post("/api/orders/razorpay/webhook", express.raw({ type: "application/json", limit: "1mb" }), razorpayWebhook);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads"), { maxAge: "7d", immutable: false, dotfiles: "deny" }));

app.get("/", (req, res) => res.json({ success: true, message: "Legend Killer Ecommerce API running", version: "2.0.0" }));
app.get("/health", (req, res) => res.json({ success: true, status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() }));
app.get("/ready", (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ success: ready, status: ready ? "ready" : "not-ready", databaseState: mongoose.connection.readyState });
});

app.use("/", sitemapRoutes);
app.use("/api", sitemapRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/addresses", addressRoutes);
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
app.use("/api/promotions", promotionRoutes);
app.use("/api/delivery", deliveryRoutes);

app.get("/api/admin/dashboard", protect, adminOnly, getDashboardSummary);
app.get("/api/admin/users-wallet-cart", protect, adminOnly, getUsers);
app.patch("/api/admin/users/:id/block", protect, adminOnly, updateUserBlockStatus);

app.use(notFound);
app.use(errorHandler);
export default app;
