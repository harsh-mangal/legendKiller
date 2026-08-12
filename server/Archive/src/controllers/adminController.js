import User from "../models/User.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email phone role amyekaCoins hasGuestOrdered lastLoginAt createdAt isBlocked").sort({ createdAt: -1 }).lean();
    const [orderCounts, carts] = await Promise.all([
      Order.aggregate([{ $match: { user: { $ne: null } } }, { $group: { _id: "$user", totalOrders: { $sum: 1 }, totalSpent: { $sum: "$totalPrice" }, latestOrderAt: { $max: "$createdAt" } } }]),
      Cart.find().select("user items").lean(),
    ]);
    const orderByUser = new Map(orderCounts.map((item) => [String(item._id), item]));
    const cartByUser = new Map(carts.map((item) => [String(item.user), item.items?.length || 0]));
    res.json({ success: true, data: users.map((user) => ({ ...user, ...(orderByUser.get(String(user._id)) || { totalOrders: 0, totalSpent: 0, latestOrderAt: null }), cartItems: cartByUser.get(String(user._id)) || 0 })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
