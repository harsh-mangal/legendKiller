import Cart from "../models/Cart.js";
import ContactMessage from "../models/ContactMessage.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { ApiError } from "../utils/apiError.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("name email phone role amyekaCoins lastLoginAt createdAt isBlocked").sort({ createdAt: -1 }).lean();
    const [orderCounts, carts] = await Promise.all([
      Order.aggregate([{ $match: { user: { $ne: null } } }, { $group: { _id: "$user", totalOrders: { $sum: 1 }, totalSpent: { $sum: "$totalPrice" }, latestOrderAt: { $max: "$createdAt" } } }]),
      Cart.find().select("user items").lean(),
    ]);
    const orderByUser = new Map(orderCounts.map((item) => [String(item._id), item]));
    const cartByUser = new Map(carts.map((item) => [String(item.user), item.items?.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0) || 0]));
    res.json({ success: true, data: users.map((user) => ({ ...user, ...(orderByUser.get(String(user._id)) || { totalOrders: 0, totalSpent: 0, latestOrderAt: null }), cartItems: cartByUser.get(String(user._id)) || 0 })) });
  } catch (error) { next(error); }
};

export const getDashboardSummary = async (req, res, next) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const [users, products, lowStock, orders, todayOrders, revenue, pendingContacts] = await Promise.all([
      User.countDocuments({ role: "USER", isBlocked: false }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, $expr: { $lte: ["$stock", "$lowStockThreshold"] } }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: start } }),
      Order.aggregate([{ $match: { paymentStatus: "PAID", orderStatus: { $ne: "CANCELLED" } } }, { $group: { _id: null, value: { $sum: "$totalPrice" } } }]),
      ContactMessage.countDocuments({ status: "NEW" }),
    ]);
    res.json({ success: true, data: { users, products, lowStock, orders, todayOrders, paidRevenue: revenue[0]?.value || 0, pendingContacts } });
  } catch (error) { next(error); }
};

export const updateUserBlockStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");
    if (user.role === "ADMIN") throw new ApiError(400, "Admin accounts cannot be blocked through this endpoint");
    user.isBlocked = Boolean(req.body.isBlocked);
    await user.save();
    res.json({ success: true, message: user.isBlocked ? "User blocked" : "User unblocked", data: user });
  } catch (error) { next(error); }
};
