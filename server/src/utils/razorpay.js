import crypto from "crypto";

export const MIN_RAZORPAY_AMOUNT_PAISE = 100;

export const toRazorpayAmount = (amountRupees) => {
  const amountPaise = Math.round(Number(amountRupees) * 100);
  if (!Number.isSafeInteger(amountPaise) || amountPaise < MIN_RAZORPAY_AMOUNT_PAISE) {
    throw new RangeError("Online payment amount must be at least ₹1.00");
  }
  return amountPaise;
};

export const verifyRazorpayPaymentSignature = ({
  orderId,
  paymentId,
  signature,
  keySecret,
}) => {
  if (!orderId || !paymentId || !signature || !keySecret) return false;

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const providedBuffer = Buffer.from(String(signature), "hex");

  return (
    expectedBuffer.length === providedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, providedBuffer)
  );
};
