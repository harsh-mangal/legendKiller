import mongoose from "mongoose";
import AmyekaCoinSetting from "../models/AmyekaCoinSetting.js";
import Combo from "../models/Combo.js";
import DeliverySetting from "../models/DeliverySetting.js";
import Product from "../models/Product.js";
import Promotion from "../models/Promotion.js";
import User from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { calculateCoinDiscount, calculatePromotionDiscount, calculateShipping } from "../utils/commerceMath.js";
import { isObjectId, normalizePincode } from "../utils/validation.js";
import { saveWithSession, useSession } from "../utils/transaction.js";

export const getDeliverySetting = async (session = null) => {
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  if (session) options.session = session;
  return DeliverySetting.findOneAndUpdate({ key: "default" }, { $setOnInsert: { key: "default" } }, options);
};

export const checkDeliveryAvailability = async (pincode, session = null) => {
  const normalized = normalizePincode(pincode);
  if (!/^[1-9][0-9]{5}$/.test(normalized)) throw new ApiError(400, "Enter a valid 6-digit Indian pincode");
  const setting = await getDeliverySetting(session);
  const excluded = new Set(setting.excludedPincodes || []);
  const included = new Set(setting.serviceablePincodes || []);
  const serviceable = !excluded.has(normalized) && (setting.serviceAllIndia || included.has(normalized));
  return {
    serviceable,
    pincode: normalized,
    codAvailable: serviceable && setting.codEnabled,
    onlinePaymentAvailable: serviceable && setting.onlinePaymentEnabled,
    estimatedDays: serviceable ? `${setting.estimatedDaysMin}-${setting.estimatedDaysMax}` : null,
    estimatedDaysMin: serviceable ? setting.estimatedDaysMin : null,
    estimatedDaysMax: serviceable ? setting.estimatedDaysMax : null,
    message: serviceable
      ? `Delivery is available to ${normalized}. Estimated delivery: ${setting.estimatedDaysMin}-${setting.estimatedDaysMax} working days.`
      : "Delivery is currently unavailable for this pincode.",
  };
};

const positiveQuantity = (value) => {
  const quantity = Number(value || 1);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new ApiError(400, "Item quantity must be a whole number between 1 and 99");
  return quantity;
};

export const buildOrderItems = async (items = [], session = null) => {
  if (!Array.isArray(items) || !items.length) throw new ApiError(400, "Cart is empty");
  if (items.length > 50) throw new ApiError(400, "Too many cart items");

  const orderItems = [];
  let itemsPrice = 0;

  for (const item of items) {
    const quantity = positiveQuantity(item.quantity);
    const comboId = item.comboId || item.combo?._id || (String(item.itemType || "").toUpperCase() === "COMBO" ? item.productId : null);

    if (comboId) {
      if (!isObjectId(comboId)) throw new ApiError(400, "Invalid combo identifier");
      const combo = await useSession(Combo.findById(comboId).populate("products.product"), session);
      if (!combo || !combo.isActive) throw new ApiError(404, "Combo is no longer available");
      if (!combo.products?.length) throw new ApiError(400, `${combo.name} has no products configured`);

      const comboProducts = [];
      for (const comboItem of combo.products) {
        const product = comboItem.product;
        const perComboQuantity = positiveQuantity(comboItem.quantity);
        const requiredQuantity = perComboQuantity * quantity;
        if (!product || !product.isActive) throw new ApiError(409, `${combo.name} contains an unavailable product`);
        if (Number(product.stock) < requiredQuantity) throw new ApiError(409, `${product.name} has only ${product.stock} item(s) available`);
        comboProducts.push({ product: product._id, quantity: perComboQuantity, name: product.name });
      }

      const unitPrice = Number(combo.price || 0);
      const lineTotal = unitPrice * quantity;
      itemsPrice += lineTotal;
      orderItems.push({
        itemType: "COMBO",
        combo: combo._id,
        comboProducts,
        name: combo.name,
        image: combo.images?.[0] || combo.products?.[0]?.product?.images?.[0] || "",
        price: unitPrice,
        mrp: Number(combo.mrp || unitPrice),
        quantity,
        totalPrice: lineTotal,
      });
      continue;
    }

    const productId = item.productId || item.product?._id || item.product;
    if (!isObjectId(productId)) throw new ApiError(400, "Invalid product identifier");
    const product = await useSession(Product.findById(productId), session);
    if (!product || !product.isActive) throw new ApiError(404, "Product is no longer available");
    if (Number(product.stock) < quantity) throw new ApiError(409, `${product.name} has only ${product.stock} item(s) available`);

    const unitPrice = Number(product.price || 0);
    const lineTotal = unitPrice * quantity;
    itemsPrice += lineTotal;
    orderItems.push({
      itemType: "PRODUCT",
      product: product._id,
      category: product.category,
      name: product.name,
      image: product.images?.[0] || "",
      sku: product.sku || "",
      hsnCode: product.hsnCode || "",
      gstRate: Number(product.gstRate || 0),
      price: unitPrice,
      mrp: Number(product.mrp || unitPrice),
      quantity,
      totalPrice: lineTotal,
    });
  }

  return { orderItems, itemsPrice: Number(itemsPrice.toFixed(2)) };
};

export const inventoryRequirements = (items) => {
  const requirements = new Map();
  const add = (id, quantity) => {
    const key = String(id || "");
    if (!key) return;
    requirements.set(key, (requirements.get(key) || 0) + Number(quantity || 0));
  };
  for (const item of items || []) {
    if (item.itemType === "COMBO") {
      for (const comboItem of item.comboProducts || []) add(comboItem.product, Number(comboItem.quantity || 1) * Number(item.quantity || 1));
    } else add(item.product, item.quantity);
  }
  return requirements;
};

export const reserveInventory = async (items, session = null) => {
  for (const [productId, quantity] of inventoryRequirements(items)) {
    const options = { new: true };
    if (session) options.session = session;
    const product = await Product.findOneAndUpdate(
      { _id: productId, isActive: true, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      options
    );
    if (!product) throw new ApiError(409, "One or more items are no longer available in the requested quantity");
  }
};

export const restoreInventory = async (items, session = null) => {
  for (const [productId, quantity] of inventoryRequirements(items)) {
    const options = session ? { session } : undefined;
    await Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } }, options);
  }
};

const promotionEligibleSubtotal = (promotion, orderItems) => {
  const productIds = new Set((promotion.eligibleProducts || []).map(String));
  const categoryIds = new Set((promotion.eligibleCategories || []).map(String));
  if (!productIds.size && !categoryIds.size) return orderItems.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
  return orderItems.reduce((sum, item) => {
    if (item.itemType !== "PRODUCT") return sum;
    if (productIds.has(String(item.product)) || categoryIds.has(String(item.category))) return sum + Number(item.totalPrice || 0);
    return sum;
  }, 0);
};

export const evaluatePromotion = async ({ code, orderItems, itemsPrice, userId = null, session = null }) => {
  const normalizedCode = String(code || "").trim().toUpperCase();
  if (!normalizedCode) return { promotion: null, code: "", discountAmount: 0 };
  const promotion = await useSession(Promotion.findOne({ code: normalizedCode }), session);
  if (!promotion || !promotion.isActive) throw new ApiError(400, "This coupon is not valid");
  const now = new Date();
  if (promotion.startsAt && promotion.startsAt > now) throw new ApiError(400, "This coupon is not active yet");
  if (promotion.endsAt && promotion.endsAt < now) throw new ApiError(400, "This coupon has expired");
  if (promotion.usageLimit != null && promotion.usageCount >= promotion.usageLimit) throw new ApiError(400, "This coupon has reached its usage limit");
  if (itemsPrice < Number(promotion.minOrderValue || 0)) throw new ApiError(400, `A minimum cart value of ₹${promotion.minOrderValue} is required for this coupon`);
  if (userId && promotion.perUserLimit) {
    const used = promotion.usedBy.filter((entry) => String(entry.user || "") === String(userId)).length;
    if (used >= promotion.perUserLimit) throw new ApiError(400, "You have already used this coupon the maximum number of times");
  }
  const eligibleSubtotal = promotionEligibleSubtotal(promotion, orderItems);
  if (eligibleSubtotal <= 0) throw new ApiError(400, "This coupon does not apply to the selected products");
  const discountAmount = calculatePromotionDiscount({
    discountType: promotion.discountType,
    discountValue: promotion.discountValue,
    eligibleSubtotal,
    maxDiscount: promotion.maxDiscount,
  });
  return { promotion, code: normalizedCode, discountAmount };
};

export const reservePromotionUse = async (promotion, { userId, orderId }, session = null) => {
  if (!promotion) return;
  const options = { new: true };
  if (session) options.session = session;
  const filter = { _id: promotion._id, isActive: true, "usedBy.order": { $ne: orderId } };
  if (promotion.usageLimit != null) filter.usageCount = { $lt: promotion.usageLimit };
  if (userId && promotion.perUserLimit) {
    const userObjectId = new mongoose.Types.ObjectId(String(userId));
    filter.$expr = {
      $lt: [
        { $size: { $filter: { input: "$usedBy", as: "entry", cond: { $eq: ["$$entry.user", userObjectId] } } } },
        Number(promotion.perUserLimit),
      ],
    };
  }
  const updated = await Promotion.findOneAndUpdate(
    filter,
    { $inc: { usageCount: 1 }, $push: { usedBy: { user: userId || null, order: orderId, usedAt: new Date() } } },
    options
  );
  if (!updated) throw new ApiError(409, "This coupon is no longer available");
};

export const releasePromotionUse = async (order, session = null) => {
  if (!order?.promotion) return;
  const options = session ? { session } : undefined;
  await Promotion.findOneAndUpdate(
    { _id: order.promotion, "usedBy.order": order._id },
    { $inc: { usageCount: -1 }, $pull: { usedBy: { order: order._id } } },
    options
  );
};

export const calculateCoinRedemption = async ({ userId, useCoins, itemsPrice, shippingPrice, couponDiscountAmount, session = null }) => {
  const totalBeforeCoins = Math.max(0, itemsPrice + shippingPrice - couponDiscountAmount);
  const result = { totalPrice: totalBeforeCoins, coinsUsed: 0, coinDiscountAmount: 0 };
  if (!userId || !useCoins) return result;
  const [setting, user] = await Promise.all([
    useSession(AmyekaCoinSetting.findOne({ key: "default" }), session),
    useSession(User.findById(userId), session),
  ]);
  if (!setting?.redeemEnabled || !user || Number(user.amyekaCoins || 0) <= 0) return result;
  const baseValue = setting.applyOn === "CART_VALUE" ? Math.max(0, itemsPrice - couponDiscountAmount) : totalBeforeCoins;
  const coinResult = calculateCoinDiscount({
    availableCoins: user.amyekaCoins,
    coinValueInRupees: setting.coinValueInRupees,
    maxRedeemPercentage: setting.maxRedeemPercentage,
    baseValue,
    payableBeforeCoins: totalBeforeCoins,
  });
  result.coinsUsed = coinResult.coinsUsed;
  result.coinDiscountAmount = coinResult.discountAmount;
  result.totalPrice = coinResult.totalPrice;
  return result;
};

export const reserveCoins = async ({ userId, coins, orderId }, session = null) => {
  if (!userId || !coins) return;
  const options = { new: true };
  if (session) options.session = session;
  const user = await User.findOneAndUpdate(
    { _id: userId, amyekaCoins: { $gte: coins } },
    {
      $inc: { amyekaCoins: -coins },
      $push: { amyekaCoinHistory: { type: "REDEEMED", coins, orderId, remark: `Redeemed ${coins} Ameyka Coins on order` } },
    },
    options
  );
  if (!user) throw new ApiError(409, "Your Ameyka Coin balance changed. Please review the order total and try again");
};

export const restoreCoins = async (order, session = null) => {
  if (!order?.user || !order.amyekaCoinsUsed || !order.amyekaCoinsRedeemedAt) return;
  const options = session ? { session } : undefined;
  await User.findByIdAndUpdate(
    order.user,
    {
      $inc: { amyekaCoins: order.amyekaCoinsUsed },
      $push: { amyekaCoinHistory: { type: "REFUND", coins: order.amyekaCoinsUsed, orderId: order._id, remark: "Coins returned after order cancellation" } },
    },
    options
  );
};

export const calculateOrderTotals = async ({ orderItems, itemsPrice, pincode, paymentMethod, couponCode, userId, useCoins, session = null }) => {
  const delivery = await checkDeliveryAvailability(pincode, session);
  if (!delivery.serviceable) throw new ApiError(400, delivery.message);
  const setting = await getDeliverySetting(session);
  if (paymentMethod === "COD" && !setting.codEnabled) throw new ApiError(400, "Cash on delivery is not available for this order");
  if (paymentMethod === "ONLINE" && !setting.onlinePaymentEnabled) throw new ApiError(400, "Online payment is currently unavailable");
  const shippingPrice = calculateShipping({
    itemsPrice,
    shippingFee: setting.shippingFee,
    freeShippingThreshold: setting.freeShippingThreshold,
  });
  const promotionResult = await evaluatePromotion({ code: couponCode, orderItems, itemsPrice, userId, session });
  const coinResult = await calculateCoinRedemption({
    userId,
    useCoins,
    itemsPrice,
    shippingPrice,
    couponDiscountAmount: promotionResult.discountAmount,
    session,
  });
  return {
    shippingPrice,
    promotion: promotionResult.promotion,
    couponCode: promotionResult.code,
    couponDiscountAmount: promotionResult.discountAmount,
    amyekaCoinsUsed: coinResult.coinsUsed,
    amyekaDiscountAmount: coinResult.coinDiscountAmount,
    discount: Number((promotionResult.discountAmount + coinResult.coinDiscountAmount).toFixed(2)),
    totalPrice: coinResult.totalPrice,
  };
};

export const markPromotionUsed = async (promotion, order, session = null) => {
  if (!promotion) return;
  await reservePromotionUse(promotion, { userId: order.user, orderId: order._id }, session);
};

export const saveDocument = saveWithSession;
