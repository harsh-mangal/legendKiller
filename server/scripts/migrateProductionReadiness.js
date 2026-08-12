import "../src/config/env.js";
import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import AmyekaCoinSetting from "../src/models/AmyekaCoinSetting.js";
import Banner from "../src/models/bannerModel.js";
import Blog from "../src/models/Blog.js";
import Cart from "../src/models/Cart.js";
import Category from "../src/models/Category.js";
import Combo from "../src/models/Combo.js";
import ContactMessage from "../src/models/ContactMessage.js";
import DeliverySetting from "../src/models/DeliverySetting.js";
import Order from "../src/models/Order.js";
import PaymentEvent from "../src/models/PaymentEvent.js";
import Product from "../src/models/Product.js";
import Promotion from "../src/models/Promotion.js";
import RateLimitBucket from "../src/models/RateLimitBucket.js";
import Testimonial from "../src/models/Testimonial.js";
import User from "../src/models/User.js";

const models = [
  AmyekaCoinSetting,
  Banner,
  Blog,
  Cart,
  Category,
  Combo,
  ContactMessage,
  DeliverySetting,
  Order,
  PaymentEvent,
  Product,
  Promotion,
  RateLimitBucket,
  Testimonial,
  User,
];

const run = async () => {
  await connectDB();
  let updatedOrders = 0;
  const cursor = Order.find({}).cursor();
  for await (const order of cursor) {
    let changed = false;
    if (!order.publicOrderNumber) {
      order.publicOrderNumber = `AV-${new Date(order.createdAt || Date.now()).getTime().toString(36).toUpperCase()}-${String(order._id).slice(-6).toUpperCase()}`;
      changed = true;
    }
    if (!order.statusHistory?.length) {
      order.statusHistory = [{ status: order.orderStatus || "PLACED", note: "Imported existing order", changedAt: order.createdAt }];
      changed = true;
    }
    if (!order.stockReservationStatus || order.stockReservationStatus === "NONE") {
      if (order.orderStatus === "CANCELLED" || order.stockRestoredAt) order.stockReservationStatus = "RELEASED";
      else if (order.paymentMethod === "COD" || order.paymentStatus === "PAID") order.stockReservationStatus = "COMMITTED";
      else order.stockReservationStatus = "NONE";
      changed = true;
    }
    for (const item of order.items || []) {
      if (item.totalPrice == null) {
        item.totalPrice = Number(item.price || 0) * Number(item.quantity || 1);
        changed = true;
      }
    }
    if (changed) {
      await order.save();
      updatedOrders += 1;
    }
  }

  await Order.collection.updateMany({ razorpayOrderId: "" }, { $unset: { razorpayOrderId: "" } });
  await Order.collection.updateMany({ razorpayPaymentId: "" }, { $unset: { razorpayPaymentId: "" } });
  await Order.collection.updateMany({ razorpaySignature: "" }, { $unset: { razorpaySignature: "" } });
  await Order.collection.updateMany({ refundId: "" }, { $unset: { refundId: "" } });

  await Product.collection.updateMany({ sku: "" }, { $unset: { sku: "" } });

  await User.collection.updateMany({}, { $unset: { otpCode: "" } });
  await User.collection.updateMany({ amyekaCoinDebt: { $exists: false } }, { $set: { amyekaCoinDebt: 0 } });
  const deliverySettings = await DeliverySetting.find().sort({ createdAt: 1 });
  if (deliverySettings[0]) {
    await DeliverySetting.updateOne({ _id: deliverySettings[0]._id }, { $set: { key: "default" } });
    if (deliverySettings.length > 1) await DeliverySetting.deleteMany({ _id: { $in: deliverySettings.slice(1).map((item) => item._id) } });
  } else {
    await DeliverySetting.create({ key: "default" });
  }

  const coinSettings = await AmyekaCoinSetting.find().sort({ createdAt: 1 });
  if (coinSettings[0]) {
    await AmyekaCoinSetting.updateOne({ _id: coinSettings[0]._id }, { $set: { key: "default" } });
    if (coinSettings.length > 1) await AmyekaCoinSetting.deleteMany({ _id: { $in: coinSettings.slice(1).map((item) => item._id) } });
  } else {
    await AmyekaCoinSetting.create({ key: "default" });
  }

  for (const model of models) await model.syncIndexes();
  console.log(`Migration complete. Updated ${updatedOrders} order(s). Existing legacy guest accounts remain claimable during registration.`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close(false).catch(() => {});
  });
