import crypto from "crypto";
import Razorpay from "razorpay";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Combo from "../models/Combo.js";
import User from "../models/User.js";
import AmyekaCoinSetting from "../models/AmyekaCoinSetting.js";
import { orderPlacedTemplate, sendMail } from "../utils/mailer.js";

const normalizeEmail = (email) => String(email || "").toLowerCase().trim();
const isOnlinePayment = (paymentMethod) => String(paymentMethod || "COD").toUpperCase() === "ONLINE";
const validPaymentMethods = new Set(["COD", "ONLINE"]);

const validateShippingAddress = (shippingAddress = {}) => {
  const required = ["fullName", "phone", "email", "addressLine1", "city", "state", "pincode"];
  const missing = required.filter((field) => !String(shippingAddress[field] || "").trim());
  if (missing.length) throw new Error(`Shipping address is incomplete: ${missing.join(", ")}`);
  if (!/^\S+@\S+\.\S+$/.test(normalizeEmail(shippingAddress.email))) throw new Error("A valid email is required");
  if (!/^\d{10}$/.test(String(shippingAddress.phone).replace(/\D/g, ""))) throw new Error("A valid 10-digit phone number is required");
};

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are missing in environment variables");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const createRazorpayOrder = async (order) => {
  const razorpayOrder = await getRazorpay().orders.create({
    amount: Math.round(Number(order.totalPrice || 0) * 100),
    currency: "INR",
    receipt: `amyeka_${String(order._id).slice(-24)}`,
    notes: {
      localOrderId: String(order._id),
      customerName: order.shippingAddress?.fullName || "",
      customerPhone: order.shippingAddress?.phone || "",
    },
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  return {
    key: process.env.RAZORPAY_KEY_ID,
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
  };
};

const verifyRazorpaySignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  return expectedSignature === razorpay_signature;
};

const verifyWebhookSignature = (body, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
};

const buildItemsFromPayload = async (items = []) => {
  if (!Array.isArray(items) || !items.length) {
    throw new Error("Cart is empty");
  }

  let itemsPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const quantity = Math.max(1, Number(item.quantity || 1));
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Item quantity must be a positive whole number");
    const comboId = item.comboId || item.combo?._id || (item.itemType === "COMBO" ? item.productId : null);

    if (comboId) {
      const combo = await Combo.findById(comboId).populate("products.product");
      if (!combo || !combo.isActive) throw new Error("Combo not found");

      for (const comboItem of combo.products || []) {
        const product = comboItem.product;
        const requiredQty = Number(comboItem.quantity || 1) * quantity;
        if (!product || !product.isActive) throw new Error("Combo product not found");
        if (Number(product.stock) < requiredQty) throw new Error(`${product.name} has only ${product.stock} item(s) in stock for this combo`);
      }

      itemsPrice += Number(combo.price) * quantity;
      orderItems.push({
        itemType: "COMBO",
        combo: combo._id,
        product: null,
        comboProducts: combo.products.map((comboItem) => ({ product: comboItem.product._id, quantity: comboItem.quantity, name: comboItem.product.name })),
        name: combo.name,
        image: combo.images?.[0] || combo.products?.[0]?.product?.images?.[0] || "",
        price: combo.price,
        quantity,
      });
      continue;
    }

    const productId = item.productId || item.product?._id || item.product;
    const product = await Product.findById(productId);

    if (!product || !product.isActive) throw new Error("Product not found");
    if (Number(product.stock) < quantity) throw new Error(`${product.name} has only ${product.stock} item(s) in stock`);

    itemsPrice += Number(product.price) * quantity;
    orderItems.push({
      itemType: "PRODUCT",
      product: product._id,
      name: product.name,
      image: product.images?.[0] || "",
      price: product.price,
      quantity,
    });
  }

  return { orderItems, itemsPrice };
};

const applyCoinLogic = async ({ userId, useAmyekaCoins, itemsPrice, shippingPrice, commit = true }) => {
  const totalBeforeCoins = itemsPrice + shippingPrice;
  const result = { totalPrice: totalBeforeCoins, amyekaCoinsUsed: 0, amyekaDiscountAmount: 0 };
  if (!userId || !useAmyekaCoins) return result;

  const setting = await AmyekaCoinSetting.findOne();
  const user = await User.findById(userId);
  if (!setting?.redeemEnabled || !user?.amyekaCoins) return result;

  const baseValue = setting.applyOn === "CART_VALUE" ? itemsPrice : totalBeforeCoins;
  const maxRedeemAmount = (baseValue * setting.maxRedeemPercentage) / 100;
  const userCoinValue = user.amyekaCoins * setting.coinValueInRupees;

  result.amyekaDiscountAmount = Math.min(userCoinValue, maxRedeemAmount);
  result.amyekaCoinsUsed = Math.floor(result.amyekaDiscountAmount / setting.coinValueInRupees);

  if (result.amyekaCoinsUsed > 0) {
    result.amyekaDiscountAmount = result.amyekaCoinsUsed * setting.coinValueInRupees;
    result.totalPrice = Math.max(totalBeforeCoins - result.amyekaDiscountAmount, 0);

    if (commit) {
      user.amyekaCoins -= result.amyekaCoinsUsed;
      user.amyekaCoinHistory.push({ type: "REDEEMED", coins: result.amyekaCoinsUsed, remark: `Redeemed ${result.amyekaCoinsUsed} Amyeka Coins on order` });
      await user.save();
    }
  }

  return result;
};

const commitCoinRedemption = async (order) => {
  if (!order.user || !order.amyekaCoinsUsed || order.amyekaCoinsRedeemedAt) return;

  const user = await User.findById(order.user);
  if (!user) return;
  if (Number(user.amyekaCoins || 0) < Number(order.amyekaCoinsUsed || 0)) {
    throw new Error("Not enough Amyeka Coins available to complete this payment");
  }

  user.amyekaCoins -= order.amyekaCoinsUsed;
  user.amyekaCoinHistory.push({
    type: "REDEEMED",
    coins: order.amyekaCoinsUsed,
    orderId: order._id,
    remark: `Redeemed ${order.amyekaCoinsUsed} Amyeka Coins on order`,
  });
  await user.save();

  order.amyekaCoinsRedeemedAt = new Date();
};

const validateStockForOrder = async (items) => {
  for (const item of items) {
    if (item.itemType === "COMBO") {
      for (const comboItem of item.comboProducts || []) {
        const product = await Product.findById(comboItem.product);
        const requiredQty = Number(comboItem.quantity || 1) * Number(item.quantity || 1);
        if (!product || !product.isActive) throw new Error(`${comboItem.name || "Combo product"} is no longer available`);
        if (Number(product.stock) < requiredQty) throw new Error(`${product.name} has only ${product.stock} item(s) in stock for this combo`);
      }
    } else {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) throw new Error(`${item.name || "Product"} is no longer available`);
      if (Number(product.stock) < Number(item.quantity || 1)) throw new Error(`${product.name} has only ${product.stock} item(s) in stock`);
    }
  }
};

const stockRequirements = (items) => {
  const requirements = new Map();
  const add = (id, quantity) => requirements.set(String(id), (requirements.get(String(id)) || 0) + Number(quantity));
  for (const item of items) {
    if (item.itemType === "COMBO") for (const comboItem of item.comboProducts || []) add(comboItem.product, Number(comboItem.quantity || 1) * Number(item.quantity || 1));
    else add(item.product, item.quantity);
  }
  return requirements;
};

const reduceStock = async (items) => {
  const reduced = [];
  try {
    for (const [productId, quantity] of stockRequirements(items)) {
      const product = await Product.findOneAndUpdate({ _id: productId, isActive: true, stock: { $gte: quantity } }, { $inc: { stock: -quantity } }, { new: true });
      if (!product) throw new Error("An item is no longer available in the requested quantity");
      reduced.push([productId, quantity]);
    }
  } catch (error) {
    await Promise.all(reduced.map(([productId, quantity]) => Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } })));
    throw error;
  }
};

const restoreStock = async (items) => {
  await Promise.all([...stockRequirements(items)].map(([productId, quantity]) => Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } })));
};

const sendOrderEmail = async (order, user) => {
  const recipient = order.shippingAddress?.email || user?.email || order.guestContact?.email;
  if (!recipient) return;
  try {
    await sendMail({
      to: recipient,
      subject: `Amyeka Veda order received #${String(order._id).slice(-8).toUpperCase()}`,
      html: orderPlacedTemplate({ userName: user?.name || order.shippingAddress?.fullName, order }),
      text: `Your Amyeka Veda order #${String(order._id).slice(-8).toUpperCase()} has been received. Total: ₹${order.totalPrice}`,
    });
  } catch (error) {
    console.error("Order email failed:", error.message);
  }
};

const finalizePaidOrder = async (order) => {
  if (order.paymentStatus === "PAID" && order.razorpayPaymentId) return order;

  await validateStockForOrder(order.items);
  await commitCoinRedemption(order);
  await reduceStock(order.items);

  if (order.guestCheckout && order.user) {
    await User.findByIdAndUpdate(order.user, { $set: { hasGuestOrdered: true } });
  }

  order.paymentStatus = "PAID";
  order.paidAt = new Date();
  await order.save();

  const user = order.user ? await User.findById(order.user) : null;
  await sendOrderEmail(order, user);

  return order;
};

export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "COD", useAmyekaCoins = false, items } = req.body;
    if (!validPaymentMethods.has(String(paymentMethod).toUpperCase())) return res.status(400).json({ success: false, message: "Invalid payment method" });
    validateShippingAddress(shippingAddress);
    const online = isOnlinePayment(paymentMethod);
    let orderItems = [];
    let itemsPrice = 0;

    if (Array.isArray(items) && items.length) {
      const built = await buildItemsFromPayload(items);
      orderItems = built.orderItems;
      itemsPrice = built.itemsPrice;
    } else {
      const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
      if (!cart || cart.items.length === 0) return res.status(400).json({ success: false, message: "Cart is empty" });
      for (const item of cart.items) {
        const product = item.product;
        if (!product || !product.isActive) throw new Error("Product not found");
        if (Number(product.stock) < Number(item.quantity || 1)) throw new Error(`${product.name} has only ${product.stock} item(s) in stock`);
        itemsPrice += product.price * item.quantity;
        orderItems.push({ product: product._id, name: product.name, image: product.images?.[0] || "", price: product.price, quantity: item.quantity });
      }
      if (!online) {
        cart.items = [];
        await cart.save();
      }
    }

    const shippingPrice = itemsPrice >= 999 ? 0 : 80;
    const coinResult = await applyCoinLogic({ userId: req.user._id, useAmyekaCoins, itemsPrice, shippingPrice, commit: !online });

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: online ? "PENDING" : "PENDING",
      itemsPrice,
      shippingPrice,
      amyekaCoinsUsed: coinResult.amyekaCoinsUsed,
      amyekaDiscountAmount: coinResult.amyekaDiscountAmount,
      totalPrice: coinResult.totalPrice,
    });

    if (online) {
      const razorpay = await createRazorpayOrder(order);
      return res.status(201).json({ success: true, message: "Razorpay order created", data: order, razorpay });
    }

    if (coinResult.amyekaCoinsUsed > 0) {
      order.amyekaCoinsRedeemedAt = new Date();
      await order.save();
      await User.findByIdAndUpdate(req.user._id, { $set: { "amyekaCoinHistory.$[elem].orderId": order._id } }, { arrayFilters: [{ "elem.type": "REDEEMED", "elem.orderId": { $exists: false } }] });
    }

    await reduceStock(orderItems);
    await sendOrderEmail(order, req.user);

    res.status(201).json({ success: true, message: "Order placed successfully", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createGuestOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "COD", items = [] } = req.body;
    const online = isOnlinePayment(paymentMethod);
    if (!validPaymentMethods.has(String(paymentMethod).toUpperCase())) return res.status(400).json({ success: false, message: "Invalid payment method" });
    const email = normalizeEmail(shippingAddress?.email);
    const phone = String(shippingAddress?.phone || "").trim();

    try { validateShippingAddress(shippingAddress); } catch (error) { return res.status(400).json({ success: false, message: error.message }); }

    const existingUser = await User.findOne({ $or: [{ email }, ...(phone ? [{ phone }] : [])] });
    if (existingUser?.hasGuestOrdered) {
      return res.status(401).json({
        success: false,
        loginRequired: true,
        message: "For your next order, please login so we can keep your order history secure.",
      });
    }

    const { orderItems, itemsPrice } = await buildItemsFromPayload(items);
    const shippingPrice = itemsPrice >= 999 ? 0 : 80;
    const totalPrice = itemsPrice + shippingPrice;

    let user = existingUser;
    if (!user) {
      user = await User.create({
        name: shippingAddress.fullName,
        email,
        phone,
        password: crypto.randomBytes(12).toString("hex"),
        hasGuestOrdered: !online,
        addresses: [{ ...shippingAddress, email, isDefault: true }],
      });
    } else {
      user.hasGuestOrdered = !online;
      user.addresses.push({ ...shippingAddress, email, isDefault: !user.addresses?.length });
      await user.save();
    }

    const order = await Order.create({
      user: user._id,
      guestCheckout: true,
      guestContact: { name: shippingAddress.fullName, email, phone },
      items: orderItems,
      shippingAddress: { ...shippingAddress, email },
      paymentMethod,
      paymentStatus: "PENDING",
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    if (online) {
      const razorpay = await createRazorpayOrder(order);
      return res.status(201).json({ success: true, message: "Razorpay order created", data: order, razorpay, loginRequiredNextTime: true });
    }

    await reduceStock(orderItems);
    await sendOrderEmail(order, user);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
      loginRequiredNextTime: true,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Razorpay payment details are required" });
    }

    const isValid = verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid Razorpay payment signature" });
    }

    const order = await Order.findOneAndUpdate(
      { _id: orderId, razorpayOrderId: razorpay_order_id, paymentStatus: "PENDING" },
      { $set: { paymentStatus: "PROCESSING", razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature } },
      { new: true }
    );
    if (!order) {
      const existing = await Order.findOne({ _id: orderId, razorpayOrderId: razorpay_order_id });
      if (existing?.paymentStatus === "PAID") return res.json({ success: true, message: "Payment already verified", data: existing });
      return res.status(409).json({ success: false, message: "Payment is already being processed or order was not found" });
    }

    let paidOrder;
    try {
      paidOrder = await finalizePaidOrder(order);
    } catch (error) {
      order.paymentStatus = "FAILED";
      await order.save();
      throw error;
    }

    res.json({ success: true, message: "Payment verified successfully", data: paidOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    if (!verifyWebhookSignature(req.body, signature)) return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    const event = JSON.parse(req.body.toString("utf8"));
    if (event.event !== "payment.captured") return res.status(200).json({ success: true, ignored: true });
    const payment = event.payload?.payment?.entity;
    if (!payment?.order_id || !payment?.id) return res.status(400).json({ success: false, message: "Invalid payment payload" });
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: payment.order_id, paymentStatus: "PENDING" },
      { $set: { paymentStatus: "PROCESSING", razorpayPaymentId: payment.id } },
      { new: true }
    );
    if (!order) return res.status(200).json({ success: true, alreadyProcessed: true });
    try {
      await finalizePaidOrder(order);
      return res.status(200).json({ success: true });
    } catch (error) {
      order.paymentStatus = "FAILED";
      await order.save();
      throw error;
    }
  } catch (error) {
    console.error("Razorpay webhook failed:", error.message);
    return res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};

export const myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email phone amyekaCoins hasGuestOrdered").populate("items.product", "slug").populate("items.combo", "slug").sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const statuses = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!statuses.includes(orderStatus)) return res.status(400).json({ success: false, message: "Invalid order status" });
    const wasCancelled = order.orderStatus === "CANCELLED";
    order.orderStatus = orderStatus;
    if (orderStatus === "CANCELLED" && !wasCancelled && !order.stockRestoredAt) {
      await restoreStock(order.items);
      order.stockRestoredAt = new Date();
      if (order.user && order.amyekaCoinsUsed) await User.findByIdAndUpdate(order.user, { $inc: { amyekaCoins: order.amyekaCoinsUsed }, $push: { amyekaCoinHistory: { type: "REFUND", coins: order.amyekaCoinsUsed, orderId: order._id, remark: "Coins returned for cancelled order" } } });
      if (order.user && order.amyekaCoinsEarned) await User.findByIdAndUpdate(order.user, { $inc: { amyekaCoins: -order.amyekaCoinsEarned }, $push: { amyekaCoinHistory: { type: "ADJUSTMENT", coins: -order.amyekaCoinsEarned, orderId: order._id, remark: "Coins reversed for cancelled order" } } });
    }
    if (orderStatus === "DELIVERED" && !order.amyekaCoinsEarned && order.user) {
      const setting = await AmyekaCoinSetting.findOne();
      if (setting?.earnEnabled) {
        const baseValue = setting.applyOn === "CART_VALUE" ? order.itemsPrice : order.totalPrice;
        const coinsEarned = Math.floor((baseValue * setting.earnPercentage) / 100);
        if (coinsEarned > 0) {
          await User.findByIdAndUpdate(order.user, {
            $inc: { amyekaCoins: coinsEarned },
            $push: { amyekaCoinHistory: { type: "EARNED", coins: coinsEarned, orderId: order._id, remark: `Earned ${coinsEarned} Amyeka Coins from order` } },
          });
          order.amyekaCoinsEarned = coinsEarned;
        }
      }
    }

    await order.save();
    res.json({ success: true, message: "Order status updated", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
