import crypto from "node:crypto";
import assert from "node:assert/strict";
import test from "node:test";

import {
  MIN_RAZORPAY_AMOUNT_PAISE,
  toRazorpayAmount,
  verifyRazorpayPaymentSignature,
} from "../src/utils/razorpay.js";

test("Razorpay amounts are converted to paise and enforce the minimum", () => {
  assert.equal(toRazorpayAmount(1), MIN_RAZORPAY_AMOUNT_PAISE);
  assert.equal(toRazorpayAmount(3799), 379900);
  assert.throws(() => toRazorpayAmount(0.99), /at least ₹1\.00/);
  assert.throws(() => toRazorpayAmount("invalid"), /at least ₹1\.00/);
});

test("Razorpay payment signatures use order id, payment id and HMAC-SHA256", () => {
  const orderId = "order_test_123";
  const paymentId = "pay_test_456";
  const keySecret = "test_secret_for_signature_only";
  const signature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  assert.equal(
    verifyRazorpayPaymentSignature({ orderId, paymentId, signature, keySecret }),
    true,
  );
  assert.equal(
    verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature: `${signature.slice(0, -1)}0`,
      keySecret,
    }),
    false,
  );
  assert.equal(
    verifyRazorpayPaymentSignature({ orderId, paymentId, signature: "", keySecret }),
    false,
  );
});
