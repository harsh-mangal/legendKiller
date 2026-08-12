export const roundMoney = (value) => Number(Math.max(0, Number(value || 0)).toFixed(2));

export const calculateShipping = ({ itemsPrice, shippingFee, freeShippingThreshold }) =>
  Number(itemsPrice || 0) >= Number(freeShippingThreshold || 0) ? 0 : roundMoney(shippingFee);

export const calculatePromotionDiscount = ({ discountType, discountValue, eligibleSubtotal, maxDiscount = null }) => {
  const subtotal = roundMoney(eligibleSubtotal);
  let amount = String(discountType).toUpperCase() === "PERCENTAGE"
    ? (subtotal * Number(discountValue || 0)) / 100
    : Number(discountValue || 0);
  if (maxDiscount != null) amount = Math.min(amount, Number(maxDiscount));
  return roundMoney(Math.min(subtotal, Math.max(0, amount)));
};

export const calculateCoinDiscount = ({ availableCoins, coinValueInRupees, maxRedeemPercentage, baseValue, payableBeforeCoins }) => {
  const coinValue = Number(coinValueInRupees || 0);
  if (coinValue <= 0 || Number(availableCoins || 0) <= 0 || Number(payableBeforeCoins || 0) <= 0) {
    return { coinsUsed: 0, discountAmount: 0, totalPrice: roundMoney(payableBeforeCoins) };
  }
  const maxRedeemAmount = (Number(baseValue || 0) * Number(maxRedeemPercentage || 0)) / 100;
  const availableValue = Number(availableCoins || 0) * coinValue;
  const rawDiscount = Math.min(maxRedeemAmount, availableValue, Number(payableBeforeCoins || 0));
  const coinsUsed = Math.max(0, Math.floor(rawDiscount / coinValue));
  const discountAmount = roundMoney(coinsUsed * coinValue);
  return { coinsUsed, discountAmount, totalPrice: roundMoney(Number(payableBeforeCoins || 0) - discountAmount) };
};
