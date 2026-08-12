import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { ApiError } from "../utils/apiError.js";
import { parseNumber } from "../utils/validation.js";

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    cart.items = cart.items.filter((item) => item.product?.isActive !== false);
    res.json({ success: true, data: cart });
  } catch (error) { next(error); }
};

export const addToCart = async (req, res, next) => {
  try {
    const quantity = parseNumber(req.body.quantity ?? 1, { name: "Quantity", min: 1, max: 99, integer: true });
    const product = await Product.findById(req.body.productId);
    if (!product || !product.isActive) throw new ApiError(404, "Product not found");
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });
    const existing = cart.items.find((item) => String(item.product) === String(product._id));
    const requestedTotal = quantity + Number(existing?.quantity || 0);
    if (Number(product.stock) < requestedTotal) throw new ApiError(409, `${product.name} has only ${product.stock} item(s) available`);
    if (existing) existing.quantity = requestedTotal;
    else cart.items.push({ product: product._id, quantity });
    await cart.save();
    await cart.populate("items.product");
    res.json({ success: true, message: "Added to cart", data: cart });
  } catch (error) { next(error); }
};

export const updateCartQuantity = async (req, res, next) => {
  try {
    const quantity = parseNumber(req.body.quantity, { name: "Quantity", min: 1, max: 99, integer: true });
    const [cart, product] = await Promise.all([Cart.findOne({ user: req.user._id }), Product.findById(req.params.productId)]);
    if (!cart) throw new ApiError(404, "Cart not found");
    if (!product || !product.isActive) throw new ApiError(404, "Product not found");
    if (Number(product.stock) < quantity) throw new ApiError(409, `${product.name} has only ${product.stock} item(s) available`);
    const item = cart.items.find((entry) => String(entry.product) === String(product._id));
    if (!item) throw new ApiError(404, "Item is not in the cart");
    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product");
    res.json({ success: true, message: "Cart updated", data: cart });
  } catch (error) { next(error); }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) throw new ApiError(404, "Cart not found");
    cart.items = cart.items.filter((item) => String(item.product) !== String(req.params.productId));
    await cart.save();
    res.json({ success: true, message: "Removed from cart", data: cart });
  } catch (error) { next(error); }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } }, { new: true, upsert: true });
    res.json({ success: true, message: "Cart cleared", data: cart });
  } catch (error) { next(error); }
};
