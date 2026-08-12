const numberFromEnv = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export const COMMERCE = Object.freeze({
  maxItemQuantity: Math.max(1, Math.floor(numberFromEnv(import.meta.env.VITE_MAX_ITEM_QUANTITY, 99))),
  freeShippingThreshold: numberFromEnv(import.meta.env.VITE_FREE_SHIPPING_THRESHOLD, 999),
  estimatedShippingCharge: numberFromEnv(import.meta.env.VITE_ESTIMATED_SHIPPING_CHARGE, 80),
});
