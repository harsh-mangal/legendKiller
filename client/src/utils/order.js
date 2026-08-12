const collectCandidates = (value) => {
  const queue = [value];
  const seen = new Set();
  const candidates = [];

  while (queue.length && candidates.length < 12) {
    const current = queue.shift();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);
    candidates.push(current);
    for (const key of ["data", "result", "payload"]) {
      if (current[key] && typeof current[key] === "object") queue.push(current[key]);
    }
  }

  return candidates;
};

export const getOrderId = (order) =>
  order?._id || order?.id || order?.orderId || order?.bookingId || "";

export const extractOrder = (response) => {
  for (const candidate of collectCandidates(response)) {
    for (const key of ["order", "createdOrder", "updatedOrder"]) {
      const order = candidate[key];
      if (order && typeof order === "object" && getOrderId(order)) return order;
    }
    if (candidate._id && (candidate.items || candidate.shippingAddress || candidate.paymentMethod)) return candidate;
  }
  return null;
};

export const extractRazorpayOrder = (response) => {
  for (const candidate of collectCandidates(response)) {
    for (const key of ["razorpay", "razorpayOrder", "paymentOrder", "payment"]) {
      const payment = candidate[key];
      if (!payment || typeof payment !== "object") continue;
      const orderId = payment.razorpayOrderId || payment.razorpay_order_id || payment.orderId || payment.id;
      if (orderId) {
        return {
          key: payment.key || payment.keyId,
          orderId,
          amount: payment.amount,
          currency: payment.currency,
        };
      }
    }

    if (candidate.razorpayOrderId || candidate.razorpay_order_id) {
      return {
        key: candidate.key || candidate.keyId,
        orderId: candidate.razorpayOrderId || candidate.razorpay_order_id,
        amount: candidate.amount,
        currency: candidate.currency,
      };
    }
  }
  return null;
};

export const getCoinBalance = (user) =>
  Number(user?.viperCoins ?? user?.legendCoins ?? user?.ameykaCoins ?? user?.amyekaCoins ?? user?.coins ?? 0);
