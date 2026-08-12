import crypto from "crypto";
import Razorpay from "razorpay";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import PaymentEvent from "../models/PaymentEvent.js";
import Promotion from "../models/Promotion.js";
import User from "../models/User.js";
import AmyekaCoinSetting from "../models/AmyekaCoinSetting.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { buildInvoiceData, generateInvoiceHtml } from "../utils/invoice.js";
import { orderPlacedTemplate, orderStatusTemplate, sendMail } from "../utils/mailer.js";
import { escapeRegex, normalizeEmail, normalizePhone, sanitizeShippingAddress, sha256 } from "../utils/validation.js";
import { withTransaction, saveWithSession, useSession } from "../utils/transaction.js";
import {
  buildOrderItems,
  calculateOrderTotals,
  markPromotionUsed,
  releasePromotionUse,
  reserveCoins,
  reserveInventory,
  restoreCoins,
  restoreInventory,
} from "../services/commerceService.js";

const validPaymentMethods = new Set(["COD", "ONLINE"]);
const transitionMap = {
  PLACED: new Set(["CONFIRMED", "CANCELLED"]),
  CONFIRMED: new Set(["PACKED", "CANCELLED"]),
  PACKED: new Set(["SHIPPED", "CANCELLED"]),
  SHIPPED: new Set(["DELIVERED"]),
  DELIVERED: new Set(["RETURN_REQUESTED"]),
  RETURN_REQUESTED: new Set(["RETURNED", "DELIVERED"]),
  RETURNED: new Set([]),
  CANCELLED: new Set([]),
};

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw new ApiError(503, "Online payment is not configured");
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

const publicOrder = (order) => {
  const value = order?.toObject ? order.toObject() : { ...(order || {}) };
  delete value.razorpaySignature;
  delete value.paymentProcessingStartedAt;
  return value;
};

const sendOrderEmail = async (order, user = null) => {
  const recipient = order.shippingAddress?.email || user?.email || order.guestContact?.email;
  if (!recipient) return;
  try {
    await sendMail({
      to: recipient,
      subject: `Ameyka Veda order received ${order.publicOrderNumber || order._id}`,
      html: orderPlacedTemplate({ userName: user?.name || order.shippingAddress?.fullName, order }),
      text: `Your Ameyka Veda order ${order.publicOrderNumber || order._id} has been received. Total: ₹${order.totalPrice}`,
    });
  } catch (error) {
    console.error("Order email failed:", error.message);
  }
};

const sendStatusEmail = async (order, message) => {
  const recipient = order.shippingAddress?.email || order.guestContact?.email;
  if (!recipient) return;
  sendMail({
    to: recipient,
    subject: `Order update ${order.publicOrderNumber || order._id}`,
    html: orderStatusTemplate({ name: order.shippingAddress?.fullName, order, message }),
    text: `${message}. Order: ${order.publicOrderNumber || order._id}. Status: ${order.orderStatus}.`,
  }).catch((error) => console.error("Order status email failed:", error.message));
};

const createRazorpayOrder = async (order) => {
  const gatewayOrder = await getRazorpay().orders.create({
    amount: Math.round(Number(order.totalPrice || 0) * 100),
    currency: "INR",
    receipt: String(order.publicOrderNumber || order._id).slice(0, 40),
    notes: {
      localOrderId: String(order._id),
      publicOrderNumber: order.publicOrderNumber || "",
      customerName: order.shippingAddress?.fullName || "",
      customerPhone: order.shippingAddress?.phone || "",
    },
  });
  order.razorpayOrderId = gatewayOrder.id;
  order.paymentStatus = "PENDING";
  order.paymentError = "";
  await order.save();
  return {
    key: process.env.RAZORPAY_KEY_ID,
    orderId: gatewayOrder.id,
    razorpayOrderId: gatewayOrder.id,
    amount: gatewayOrder.amount,
    currency: gatewayOrder.currency,
  };
};

const verifyRazorpaySignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  const provided = String(razorpay_signature || "");
  return expected.length === provided.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
};

const verifyWebhookSignature = (body, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const provided = String(signature);
  return expected.length === provided.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
};

const reserveOrder = async ({ user = null, guestCheckout = false, shippingAddress, paymentMethod, items, useCoins, couponCode }) => {
  return withTransaction(async (session) => {
    const { orderItems, itemsPrice } = await buildOrderItems(items, session);
    const totals = await calculateOrderTotals({
      orderItems,
      itemsPrice,
      pincode: shippingAddress.pincode,
      paymentMethod,
      couponCode,
      userId: user?._id || null,
      useCoins,
      session,
    });

    await reserveInventory(orderItems, session);
    const online = paymentMethod === "ONLINE";
    const order = new Order({
      user: user?._id || null,
      guestCheckout,
      guestContact: guestCheckout ? { name: shippingAddress.fullName, email: shippingAddress.email, phone: shippingAddress.phone } : undefined,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
      stockReservationStatus: online ? "RESERVED" : "COMMITTED",
      stockReservedAt: new Date(),
      reservationExpiresAt: online ? new Date(Date.now() + env.reservationMinutes * 60 * 1000) : null,
      itemsPrice,
      shippingPrice: totals.shippingPrice,
      couponCode: totals.couponCode,
      couponDiscountAmount: totals.couponDiscountAmount,
      promotion: totals.promotion?._id || null,
      amyekaCoinsUsed: totals.amyekaCoinsUsed,
      amyekaDiscountAmount: totals.amyekaDiscountAmount,
      discount: totals.discount,
      totalPrice: totals.totalPrice,
      statusHistory: [{ status: "PLACED", note: online ? "Inventory reserved while payment is pending" : "Order placed" }],
    });
    await saveWithSession(order, session);

    if (totals.amyekaCoinsUsed > 0) {
      await reserveCoins({ userId: user._id, coins: totals.amyekaCoinsUsed, orderId: order._id }, session);
      order.amyekaCoinsRedeemedAt = new Date();
      await saveWithSession(order, session);
    }
    await markPromotionUsed(totals.promotion, order, session);
    if (user) await Cart.findOneAndUpdate({ user: user._id }, { $set: { items: [] } }, session ? { session } : undefined);
    return order;
  });
};

export const releaseOrderResources = async (orderId, { reason = "Order cancelled", paymentStatus = null } = {}) => {
  return withTransaction(async (session) => {
    const order = await useSession(Order.findById(orderId), session);
    if (!order) throw new ApiError(404, "Order not found");
    if (["RELEASED"].includes(order.stockReservationStatus)) return order;
    if (["RESERVED", "COMMITTED"].includes(order.stockReservationStatus) && !["DELIVERED", "RETURNED"].includes(order.orderStatus)) {
      await restoreInventory(order.items, session);
      order.stockReservationStatus = "RELEASED";
      order.stockReleasedAt = new Date();
    }
    await restoreCoins(order, session);
    if (order.amyekaCoinsRedeemedAt) order.amyekaCoinsRedeemedAt = null;
    await releasePromotionUse(order, session);
    order.orderStatus = "CANCELLED";
    order.reservationExpiresAt = null;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    order.statusHistory.push({ status: "CANCELLED", note: reason });
    order.cancellation.status = "APPROVED";
    order.cancellation.resolvedAt = new Date();
    await saveWithSession(order, session);
    return order;
  });
};

const finalizeCapturedPayment = async ({ orderId, razorpayOrderId, paymentId, signature = "" }) => {
  return withTransaction(async (session) => {
    const order = await useSession(Order.findOne({ _id: orderId, razorpayOrderId }), session);
    if (!order) throw new ApiError(404, "Order not found");
    if (order.paymentStatus === "PAID") return order;
    if (order.orderStatus === "CANCELLED" || order.stockReservationStatus === "RELEASED") {
      throw new ApiError(409, "ORDER_RESERVATION_RELEASED");
    }
    if (order.stockReservationStatus !== "RESERVED") throw new ApiError(409, "Order inventory reservation is invalid");
    order.paymentStatus = "PAID";
    order.paymentError = "";
    order.razorpayPaymentId = paymentId;
    order.razorpaySignature = signature;
    order.paidAt = new Date();
    order.stockReservationStatus = "COMMITTED";
    order.reservationExpiresAt = null;
    if (order.orderStatus === "PLACED") order.orderStatus = "CONFIRMED";
    order.statusHistory.push({ status: order.orderStatus, note: "Online payment confirmed" });
    await saveWithSession(order, session);
    return order;
  });
};

const refundCapturedPayment = async (paymentId, amountPaise = undefined, notes = {}) => {
  const razorpay = getRazorpay();
  const payment = await razorpay.payments.fetch(paymentId);
  const capturedAmount = Math.max(0, Number(payment.amount || 0));
  const alreadyRefunded = Math.max(0, Number(payment.amount_refunded || 0));
  const remaining = Math.max(0, capturedAmount - alreadyRefunded);
  const requested = amountPaise == null ? remaining : Math.max(0, Math.min(Number(amountPaise), remaining));
  if (requested <= 0) {
    return { id: "", amount: 0, totalRefunded: alreadyRefunded, alreadyRefunded: true };
  }
  const refund = await razorpay.payments.refund(paymentId, { amount: requested, notes });
  return { ...refund, totalRefunded: alreadyRefunded + Number(refund.amount || requested), alreadyRefunded: false };
};

const refundTotalRupees = (refund) => Number(refund?.totalRefunded ?? refund?.amount ?? 0) / 100;

const handleCapturedAfterRelease = async (order, paymentId) => {
  const refund = await refundCapturedPayment(paymentId, Math.round(Number(order.totalPrice || 0) * 100), { reason: "Order reservation expired" });
  order.paymentStatus = "REFUNDED";
  order.razorpayPaymentId = paymentId;
  order.refundId = refund.id || order.refundId;
  order.refundAmount = refundTotalRupees(refund);
  order.refundedAt = new Date();
  order.paymentError = "Payment was captured after the reservation expired and was refunded.";
  await order.save();
  return order;
};

const createOrderHandler = ({ guestCheckout }) => async (req, res, next) => {
  let order;
  try {
    const shippingAddress = sanitizeShippingAddress(req.body.shippingAddress);
    const paymentMethod = String(req.body.paymentMethod || "COD").toUpperCase();
    if (!validPaymentMethods.has(paymentMethod)) throw new ApiError(400, "Invalid payment method");
    const useCoins = !guestCheckout && Boolean(req.body.useAmeykaCoins ?? req.body.useAmyekaCoins);
    order = await reserveOrder({
      user: guestCheckout ? null : req.user,
      guestCheckout,
      shippingAddress,
      paymentMethod,
      items: req.body.items || [],
      useCoins,
      couponCode: req.body.couponCode,
    });
    if (paymentMethod === "ONLINE") {
      try {
        const razorpay = await createRazorpayOrder(order);
        return res.status(201).json({ success: true, message: "Order created. Complete payment to confirm it.", data: publicOrder(order), razorpay });
      } catch (gatewayError) {
        await releaseOrderResources(order._id, { reason: "Payment provider could not create a payment order", paymentStatus: "FAILED" });
        throw gatewayError;
      }
    }
    await sendOrderEmail(order, req.user || null);
    res.status(201).json({ success: true, message: "Order placed successfully", data: publicOrder(order) });
  } catch (error) {
    next(error);
  }
};

export const createOrder = createOrderHandler({ guestCheckout: false });
export const createGuestOrder = createOrderHandler({ guestCheckout: true });

export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) throw new ApiError(400, "Razorpay payment details are required");
    if (!verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature })) throw new ApiError(400, "Invalid payment signature");

    const existing = await Order.findOne({ _id: orderId, razorpayOrderId: razorpay_order_id });
    if (!existing) throw new ApiError(404, "Order not found");
    if (existing.paymentStatus === "PAID") return res.json({ success: true, message: "Payment already verified", data: publicOrder(existing) });

    let payment = await getRazorpay().payments.fetch(razorpay_payment_id);
    if (payment.order_id !== razorpay_order_id) throw new ApiError(400, "Payment does not belong to this order");
    if (Number(payment.amount) !== Math.round(Number(existing.totalPrice || 0) * 100)) throw new ApiError(400, "Payment amount does not match the order total");
    if (payment.status === "authorized") payment = await getRazorpay().payments.capture(razorpay_payment_id, payment.amount, payment.currency || "INR");
    if (payment.status !== "captured") throw new ApiError(409, "Payment has not been captured yet");

    let paidOrder;
    try {
      paidOrder = await finalizeCapturedPayment({ orderId, razorpayOrderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature });
    } catch (error) {
      if (error.message === "ORDER_RESERVATION_RELEASED") {
        paidOrder = await handleCapturedAfterRelease(existing, razorpay_payment_id);
        throw new ApiError(409, "The inventory reservation expired before payment confirmation. The captured amount has been refunded.");
      }
      throw error;
    }
    await sendOrderEmail(paidOrder, paidOrder.user ? await User.findById(paidOrder.user) : null);
    res.json({ success: true, message: "Payment verified successfully", data: publicOrder(paidOrder) });
  } catch (error) {
    next(error);
  }
};

export const razorpayWebhook = async (req, res) => {
  const rawBody = req.body;
  let eventKey = "";
  try {
    const signature = req.headers["x-razorpay-signature"];
    if (!verifyWebhookSignature(rawBody, signature)) return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    const event = JSON.parse(rawBody.toString("utf8"));
    const payment = event.payload?.payment?.entity;
    const refund = event.payload?.refund?.entity;
    eventKey = event.id || sha256(rawBody);

    const processingPayload = {
      eventType: String(event.event || "unknown"),
      paymentId: payment?.id || refund?.payment_id || "",
      razorpayOrderId: payment?.order_id || "",
      status: "PROCESSING",
      error: "",
      processedAt: null,
    };
    const staleBefore = new Date(Date.now() - 5 * 60 * 1000);
    let eventRecord = await PaymentEvent.findOneAndUpdate(
      { eventKey, $or: [{ status: "FAILED" }, { status: "PROCESSING", updatedAt: { $lte: staleBefore } }] },
      { $set: processingPayload },
      { new: true }
    );
    if (!eventRecord) {
      const existingEvent = await PaymentEvent.findOne({ eventKey });
      if (existingEvent?.status === "COMPLETED") return res.status(200).json({ success: true, duplicate: true });
      if (existingEvent?.status === "PROCESSING") return res.status(202).json({ success: true, processing: true });
      try {
        eventRecord = await PaymentEvent.create({ eventKey, ...processingPayload });
      } catch (error) {
        if (error?.code === 11000) return res.status(202).json({ success: true, processing: true });
        throw error;
      }
    }

    if (event.event === "payment.captured" && payment?.order_id && payment?.id) {
      const order = await Order.findOne({ razorpayOrderId: payment.order_id });
      if (order && order.paymentStatus !== "PAID") {
        if (Number(payment.amount) !== Math.round(Number(order.totalPrice || 0) * 100)) throw new Error("Webhook payment amount mismatch");
        try {
          const paidOrder = await finalizeCapturedPayment({ orderId: order._id, razorpayOrderId: payment.order_id, paymentId: payment.id });
          await sendOrderEmail(paidOrder, paidOrder.user ? await User.findById(paidOrder.user) : null);
        } catch (error) {
          if (error.message === "ORDER_RESERVATION_RELEASED") await handleCapturedAfterRelease(order, payment.id);
          else throw error;
        }
      }
    } else if (event.event === "payment.failed" && payment?.order_id) {
      await Order.findOneAndUpdate(
        { razorpayOrderId: payment.order_id, paymentStatus: { $ne: "PAID" } },
        { $set: { paymentStatus: "PENDING", paymentError: payment.error_description || "Payment attempt failed" } }
      );
    } else if (event.event === "refund.processed" && refund?.payment_id) {
      await Order.findOneAndUpdate(
        { razorpayPaymentId: refund.payment_id },
        {
          $set: { paymentStatus: "REFUNDED", refundId: refund.id, refundedAt: new Date() },
          $max: { refundAmount: Number(refund.amount || 0) / 100 },
        }
      );
    }

    await PaymentEvent.updateOne(
      { eventKey },
      { $set: { status: "COMPLETED", processedAt: new Date(), error: "" } }
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Razorpay webhook failed:", error.message);
    if (eventKey) {
      await PaymentEvent.updateOne(
        { eventKey },
        { $set: { status: "FAILED", error: String(error.message || "Webhook processing failed").slice(0, 1000) } }
      ).catch(() => {});
    }
    return res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};

export const myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("items.product", "slug").populate("items.combo", "slug").sort({ createdAt: -1 });
    res.json({ success: true, data: orders.map(publicOrder) });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product", "slug name").populate("items.combo", "slug name");
    if (!order) throw new ApiError(404, "Order not found");
    if (req.user.role !== "ADMIN" && String(order.user || "") !== String(req.user._id)) throw new ApiError(403, "You do not have access to this order");
    res.json({ success: true, data: publicOrder(order) });
  } catch (error) {
    next(error);
  }
};

const findTrackableOrder = async (orderReference, contact) => {
  const normalizedContactEmail = normalizeEmail(contact);
  const normalizedContactPhone = normalizePhone(contact);
  const contactConditions = [];
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedContactEmail)) {
    contactConditions.push({ "shippingAddress.email": normalizedContactEmail }, { "guestContact.email": normalizedContactEmail });
  }
  if (/^[6-9][0-9]{9}$/.test(normalizedContactPhone)) {
    contactConditions.push({ "shippingAddress.phone": normalizedContactPhone }, { "guestContact.phone": normalizedContactPhone });
  }
  if (!contactConditions.length) throw new ApiError(400, "Enter the email or mobile number used at checkout");
  const contactMatch = { $or: contactConditions };
  const reference = String(orderReference || "").trim();
  if (!reference) throw new ApiError(400, "Order number is required");
  if (/^[0-9a-fA-F]{24}$/.test(reference)) return Order.findOne({ _id: reference, guestCheckout: true, ...contactMatch });
  let order = await Order.findOne({ publicOrderNumber: reference.toUpperCase(), guestCheckout: true, ...contactMatch });
  if (order) return order;
  if (/^[0-9a-fA-F]{8}$/.test(reference)) {
    const matches = await Order.aggregate([
      { $match: { guestCheckout: true, ...contactMatch } },
      { $addFields: { idString: { $toString: "$_id" } } },
      { $match: { idString: { $regex: `${reference}$`, $options: "i" } } },
      { $limit: 1 },
    ]);
    if (matches[0]) order = await Order.findById(matches[0]._id);
  }
  return order;
};

export const trackGuestOrder = async (req, res, next) => {
  try {
    const order = await findTrackableOrder(req.body.orderId, req.body.contact);
    if (!order) throw new ApiError(404, "No order was found with those details");
    const safeOrder = order.toObject();
    delete safeOrder.razorpaySignature;
    delete safeOrder.razorpayPaymentId;
    delete safeOrder.razorpayOrderId;
    res.json({ success: true, data: safeOrder });
  } catch (error) {
    next(error);
  }
};

export const retryPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");
    if (order.user && (!req.user || (req.user.role !== "ADMIN" && String(order.user) !== String(req.user._id)))) throw new ApiError(403, "You do not have access to this order");
    if (order.paymentMethod !== "ONLINE") throw new ApiError(400, "This order does not use online payment");
    if (order.paymentStatus === "PAID") return res.json({ success: true, message: "Order is already paid", data: order });
    if (order.orderStatus === "CANCELLED" || order.stockReservationStatus !== "RESERVED" || !order.reservationExpiresAt || order.reservationExpiresAt < new Date()) {
      throw new ApiError(409, "The payment reservation has expired. Please place a new order");
    }
    const razorpay = order.razorpayOrderId
      ? { key: process.env.RAZORPAY_KEY_ID, orderId: order.razorpayOrderId, razorpayOrderId: order.razorpayOrderId, amount: Math.round(order.totalPrice * 100), currency: "INR" }
      : await createRazorpayOrder(order);
    const orderSummary = {
      _id: order._id,
      publicOrderNumber: order.publicOrderNumber,
      totalPrice: order.totalPrice,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      reservationExpiresAt: order.reservationExpiresAt,
    };
    res.json({ success: true, message: "Payment can be retried", data: { order: orderSummary, razorpay }, razorpay });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");
    if (String(order.user || "") !== String(req.user._id)) throw new ApiError(403, "You do not have access to this order");
    if (!["PLACED", "CONFIRMED"].includes(order.orderStatus)) throw new ApiError(409, "This order can no longer be cancelled online");
    const reason = String(req.body.reason || "Customer requested cancellation").trim();
    if (order.paymentStatus === "PAID" && order.paymentMethod === "ONLINE") {
      order.cancellation = { requestedAt: new Date(), requestedBy: req.user._id, reason, status: "REQUESTED" };
      await order.save();
      return res.json({ success: true, message: "Cancellation request submitted. The refund will be processed after approval.", data: order });
    }
    order.cancellation = { requestedAt: new Date(), requestedBy: req.user._id, reason, status: "REQUESTED" };
    await order.save();
    const cancelled = await releaseOrderResources(order._id, { reason, paymentStatus: order.paymentStatus === "PAID" ? order.paymentStatus : "CANCELLED" });
    await sendStatusEmail(cancelled, "Your order has been cancelled.");
    res.json({ success: true, message: "Order cancelled", data: cancelled });
  } catch (error) {
    next(error);
  }
};

export const requestReturn = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");
    if (String(order.user || "") !== String(req.user._id)) throw new ApiError(403, "You do not have access to this order");
    if (order.orderStatus !== "DELIVERED") throw new ApiError(409, "Returns can be requested only after delivery");
    const deliveredAt = order.tracking?.deliveredAt || order.updatedAt;
    const returnDeadline = new Date(deliveredAt.getTime() + env.returnWindowDays * 24 * 60 * 60 * 1000);
    if (new Date() > returnDeadline) throw new ApiError(409, `The ${env.returnWindowDays}-day return window has ended`);
    const reason = String(req.body.reason || "").trim();
    if (reason.length < 10) throw new ApiError(400, "Please provide a clear return reason");
    order.returnRequests.push({ reason, type: String(req.body.type || "RETURN").toUpperCase() });
    order.orderStatus = "RETURN_REQUESTED";
    order.statusHistory.push({ status: "RETURN_REQUESTED", note: reason, changedBy: req.user._id });
    await order.save();
    res.status(201).json({ success: true, message: "Return request submitted", data: order });
  } catch (error) {
    next(error);
  }
};

export const downloadInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");
    if (req.user.role !== "ADMIN" && String(order.user || "") !== String(req.user._id)) throw new ApiError(403, "You do not have access to this invoice");
    if (order.paymentMethod === "ONLINE" && order.paymentStatus !== "PAID") throw new ApiError(409, "Invoice is available after payment confirmation");
    const invoice = await generateInvoiceHtml(order);
    await order.save();
    res.json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 25)));
    const query = {};
    if (req.query.orderStatus) query.orderStatus = req.query.orderStatus;
    if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;
    if (req.query.search) {
      const search = escapeRegex(String(req.query.search).trim());
      query.$or = [
        { publicOrderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
        { "shippingAddress.email": { $regex: search, $options: "i" } },
        { "shippingAddress.phone": { $regex: search, $options: "i" } },
      ];
    }
    const [orders, total] = await Promise.all([
      Order.find(query).populate("user", "name email phone amyekaCoins").populate("items.product", "slug").populate("items.combo", "slug").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Order.countDocuments(query),
    ]);
    res.json({ success: true, data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

const awardCoinsForDelivery = async (order, session) => {
  if (!order.user || order.amyekaCoinsEarned) return;
  const setting = await useSession(AmyekaCoinSetting.findOne({ key: "default" }), session);
  if (!setting?.earnEnabled) return;
  const baseValue = setting.applyOn === "CART_VALUE" ? order.itemsPrice : order.totalPrice;
  const coins = Math.floor((Number(baseValue || 0) * Number(setting.earnPercentage || 0)) / 100);
  if (coins <= 0) return;

  const user = await useSession(User.findById(order.user).select("+amyekaCoinDebt"), session);
  if (!user) return;
  const debtOffset = Math.min(Number(user.amyekaCoinDebt || 0), coins);
  const credited = coins - debtOffset;
  user.amyekaCoinDebt = Math.max(0, Number(user.amyekaCoinDebt || 0) - debtOffset);
  user.amyekaCoins = Number(user.amyekaCoins || 0) + credited;
  if (debtOffset > 0) {
    user.amyekaCoinHistory.push({ type: "ADJUSTMENT", coins: 0, orderId: order._id, remark: `${debtOffset} earned Ameyka Coins adjusted against a previous return balance` });
  }
  if (credited > 0) {
    user.amyekaCoinHistory.push({ type: "EARNED", coins: credited, orderId: order._id, remark: `Earned ${credited} Ameyka Coins from order` });
  }
  await saveWithSession(user, session);
  order.amyekaCoinsEarned = coins;
  order.amyekaCoinsCredited = credited;
  order.amyekaCoinDebtOffset = debtOffset;
};

const reverseEarnedCoins = async (order, session) => {
  const earned = Number(order.amyekaCoinsEarned || 0);
  const alreadyReversed = Number(order.amyekaCoinsReversed || 0);
  const outstanding = Math.max(0, earned - alreadyReversed);
  if (!order.user || outstanding <= 0) return;

  const user = await useSession(User.findById(order.user).select("+amyekaCoinDebt"), session);
  if (!user) return;
  const deducted = Math.min(Number(user.amyekaCoins || 0), outstanding);
  const debtCreated = outstanding - deducted;
  user.amyekaCoins = Math.max(0, Number(user.amyekaCoins || 0) - deducted);
  user.amyekaCoinDebt = Number(user.amyekaCoinDebt || 0) + debtCreated;
  user.amyekaCoinHistory.push({
    type: "ADJUSTMENT",
    coins: -deducted,
    orderId: order._id,
    remark: debtCreated > 0
      ? `${deducted} coins reversed and ${debtCreated} coins carried forward after return`
      : `${deducted} coins reversed after return`,
  });
  await saveWithSession(user, session);
  order.amyekaCoinsReversed = alreadyReversed + outstanding;
  order.amyekaCoinDebtCreated = Number(order.amyekaCoinDebtCreated || 0) + debtCreated;
};

const refundOrderPayment = async (order) => {
  if (order.paymentMethod !== "ONLINE" || order.paymentStatus !== "PAID" || !order.razorpayPaymentId) return null;
  const refund = await refundCapturedPayment(order.razorpayPaymentId, Math.round(Number(order.totalPrice || 0) * 100), { orderId: String(order._id), reason: "Order cancelled" });
  return refund;
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const nextStatus = String(req.body.orderStatus || "").toUpperCase();
    const existing = await Order.findById(req.params.id);
    if (!existing) throw new ApiError(404, "Order not found");
    if (!transitionMap[existing.orderStatus]?.has(nextStatus)) throw new ApiError(409, `Cannot change order from ${existing.orderStatus} to ${nextStatus}`);

    let refund = null;
    if (nextStatus === "CANCELLED") refund = await refundOrderPayment(existing);

    let updated;
    if (nextStatus === "CANCELLED") {
      updated = await releaseOrderResources(existing._id, { reason: req.body.note || "Cancelled by administrator", paymentStatus: refund ? "REFUNDED" : existing.paymentStatus === "PAID" ? "PAID" : "CANCELLED" });
      if (refund) {
        updated.refundId = refund.id || updated.refundId;
        updated.refundAmount = refundTotalRupees(refund);
        updated.refundedAt = new Date();
        await updated.save();
      }
    } else {
      updated = await withTransaction(async (session) => {
        const order = await useSession(Order.findById(existing._id), session);
        order.orderStatus = nextStatus;
        order.statusHistory.push({ status: nextStatus, note: String(req.body.note || "").trim(), changedBy: req.user._id });
        if (nextStatus === "SHIPPED") {
          order.tracking = {
            ...(order.tracking?.toObject?.() || order.tracking || {}),
            courierName: String(req.body.courierName || order.tracking?.courierName || "").trim(),
            trackingNumber: String(req.body.trackingNumber || order.tracking?.trackingNumber || "").trim(),
            trackingUrl: String(req.body.trackingUrl || order.tracking?.trackingUrl || "").trim(),
            shippedAt: new Date(),
          };
        }
        if (nextStatus === "DELIVERED") {
          order.tracking.deliveredAt = new Date();
          if (order.paymentMethod === "COD") {
            order.paymentStatus = "PAID";
            order.paidAt = new Date();
          }
          await awardCoinsForDelivery(order, session);
        }
        if (nextStatus === "RETURNED") await reverseEarnedCoins(order, session);
        await saveWithSession(order, session);
        return order;
      });
    }
    await sendStatusEmail(updated, `Your order status is now ${updated.orderStatus}.`);
    res.json({ success: true, message: "Order status updated", data: updated });
  } catch (error) {
    next(error);
  }
};

export const resolveReturnRequest = async (req, res, next) => {
  try {
    const existing = await Order.findById(req.params.id);
    if (!existing) throw new ApiError(404, "Order not found");
    const existingRequest = existing.returnRequests.id(req.params.returnId);
    if (!existingRequest) throw new ApiError(404, "Return request not found");
    const status = String(req.body.status || "").toUpperCase();
    if (!["APPROVED", "REJECTED", "COMPLETED"].includes(status)) throw new ApiError(400, "Invalid return status");

    let refund = null;
    if (status === "COMPLETED" && existing.paymentMethod === "ONLINE" && existing.paymentStatus === "PAID") {
      refund = await refundCapturedPayment(
        existing.razorpayPaymentId,
        Math.round(Number(existing.totalPrice || 0) * 100),
        { orderId: String(existing._id), reason: "Approved return" }
      );
    }

    const order = await withTransaction(async (session) => {
      const current = await useSession(Order.findById(existing._id), session);
      const request = current.returnRequests.id(req.params.returnId);
      request.status = status;
      request.adminNote = String(req.body.adminNote || "").trim();
      if (["REJECTED", "COMPLETED"].includes(status)) request.resolvedAt = new Date();
      if (status === "REJECTED") {
        current.orderStatus = "DELIVERED";
        current.statusHistory.push({ status: "DELIVERED", note: "Return request rejected", changedBy: req.user._id });
      }
      if (status === "APPROVED") {
        current.orderStatus = "RETURN_REQUESTED";
        current.statusHistory.push({ status: "RETURN_REQUESTED", note: "Return request approved", changedBy: req.user._id });
      }
      if (status === "COMPLETED") {
        current.orderStatus = "RETURNED";
        current.statusHistory.push({ status: "RETURNED", note: "Return completed", changedBy: req.user._id });
        await reverseEarnedCoins(current, session);
        if (refund) {
          current.paymentStatus = "REFUNDED";
          current.refundId = refund.id || current.refundId;
          current.refundAmount = refundTotalRupees(refund);
          current.refundedAt = new Date();
        } else if (current.paymentMethod === "COD") {
          current.paymentStatus = "REFUNDED";
          current.refundAmount = Number(current.totalPrice || 0);
          current.refundedAt = new Date();
        }
      }
      await saveWithSession(current, session);
      return current;
    });
    await sendStatusEmail(order, status === "COMPLETED" ? "Your return has been completed." : `Your return request is ${status.toLowerCase()}.`);
    res.json({ success: true, message: "Return request updated", data: order });
  } catch (error) {
    next(error);
  }
};

export const releaseExpiredReservations = async () => {
  const expired = await Order.find({
    paymentMethod: "ONLINE",
    paymentStatus: { $in: ["PENDING", "FAILED"] },
    stockReservationStatus: "RESERVED",
    reservationExpiresAt: { $lte: new Date() },
  }).select("_id").limit(100);
  for (const order of expired) {
    try {
      await releaseOrderResources(order._id, { reason: "Online payment reservation expired", paymentStatus: "FAILED" });
    } catch (error) {
      console.error("Reservation release failed:", order._id, error.message);
    }
  }
  return expired.length;
};

export const getInvoicePreview = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");
    res.json({ success: true, data: buildInvoiceData(order) });
  } catch (error) {
    next(error);
  }
};
