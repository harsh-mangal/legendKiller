import test from "node:test";
import assert from "node:assert/strict";
import { calculateCoinDiscount, calculatePromotionDiscount, calculateShipping, roundMoney } from "../src/utils/commerceMath.js";

test("shipping becomes free at threshold", () => {
  assert.equal(calculateShipping({ itemsPrice: 998, shippingFee: 80, freeShippingThreshold: 999 }), 80);
  assert.equal(calculateShipping({ itemsPrice: 999, shippingFee: 80, freeShippingThreshold: 999 }), 0);
});

test("percentage coupons respect maximum discount", () => {
  assert.equal(calculatePromotionDiscount({ discountType: "PERCENTAGE", discountValue: 20, eligibleSubtotal: 2000, maxDiscount: 250 }), 250);
});

test("fixed coupons cannot exceed eligible subtotal", () => {
  assert.equal(calculatePromotionDiscount({ discountType: "FIXED", discountValue: 500, eligibleSubtotal: 300 }), 300);
});

test("coin redemption respects both percentage and available balance", () => {
  assert.deepEqual(calculateCoinDiscount({ availableCoins: 100, coinValueInRupees: 1, maxRedeemPercentage: 20, baseValue: 1000, payableBeforeCoins: 1080 }), { coinsUsed: 100, discountAmount: 100, totalPrice: 980 });
  assert.deepEqual(calculateCoinDiscount({ availableCoins: 500, coinValueInRupees: 1, maxRedeemPercentage: 20, baseValue: 1000, payableBeforeCoins: 1080 }), { coinsUsed: 200, discountAmount: 200, totalPrice: 880 });
});

test("money rounding is stable", () => assert.equal(roundMoney(10.239), 10.24));
