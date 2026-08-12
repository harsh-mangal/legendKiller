import test from "node:test";
import assert from "node:assert/strict";
import { catalogItemPath, getCatalogType } from "../src/utils/catalog.js";
import { discountPercent, formatDate, shortOrderId } from "../src/utils/format.js";
import { extractOrder, extractRazorpayOrder, getCoinBalance, getOrderId } from "../src/utils/order.js";
import { safeInternalPath } from "../src/utils/routing.js";
import {
  getCheckoutValidationError,
  getContactValidationError,
  isValidEmail,
  isValidIndianPhone,
  isValidIndianPincode,
  normalizePhone,
} from "../src/utils/validation.js";

test("normalizes Indian phone numbers", () => {
  assert.equal(normalizePhone("+91 98886-26212"), "9888626212");
  assert.equal(isValidIndianPhone("+91 98886-26212"), true);
  assert.equal(isValidIndianPhone("12345"), false);
});

test("validates email and pincode", () => {
  assert.equal(isValidEmail("customer@example.com"), true);
  assert.equal(isValidEmail("customer@"), false);
  assert.equal(isValidIndianPincode("302016"), true);
  assert.equal(isValidIndianPincode("012345"), false);
});

test("valid checkout data passes", () => {
  assert.equal(
    getCheckoutValidationError({
      fullName: "Test Customer",
      email: "customer@example.com",
      phone: "9888626212",
      addressLine1: "12 Market Road",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302016",
    }),
    ""
  );
});

test("invalid checkout data returns the first actionable error", () => {
  assert.equal(getCheckoutValidationError({}), "Full name is required.");
});

test("contact form enforces useful message content", () => {
  assert.equal(
    getContactValidationError({
      name: "Test Customer",
      email: "customer@example.com",
      phone: "9888626212",
      subject: "Order support",
      message: "Please help me with the status of my recent order.",
    }),
    ""
  );
  assert.match(
    getContactValidationError({
      name: "T",
      email: "bad",
      phone: "1",
      subject: "Hi",
      message: "Short",
    }),
    /full name/i
  );
});

test("format helpers handle discounts, IDs and invalid dates", () => {
  assert.equal(discountPercent(1000, 750), 25);
  assert.equal(discountPercent(0, 750), 0);
  assert.equal(shortOrderId("order_123456789"), "23456789");
  assert.equal(formatDate("not-a-date"), "—");
});

test("allows only safe internal redirect paths", () => {
  assert.equal(safeInternalPath("/checkout?step=payment"), "/checkout?step=payment");
  assert.equal(safeInternalPath("//example.com"), "/profile");
  assert.equal(safeInternalPath("https://example.com"), "/profile");
  assert.equal(safeInternalPath("/orders\\external"), "/profile");
});

test("extracts nested order and Razorpay responses without confusing their IDs", () => {
  const response = {
    data: {
      order: { _id: "local-order-1", items: [] },
      razorpayOrder: { id: "order_gateway_1", amount: 129900, currency: "INR" },
    },
  };
  assert.equal(getOrderId(extractOrder(response)), "local-order-1");
  assert.deepEqual(extractRazorpayOrder(response), {
    key: undefined,
    orderId: "order_gateway_1",
    amount: 129900,
    currency: "INR",
  });
});

test("supports current and legacy coin balance fields", () => {
  assert.equal(getCoinBalance({ ameykaCoins: 20 }), 20);
  assert.equal(getCoinBalance({ amyekaCoins: 15 }), 15);
  assert.equal(getCoinBalance(null), 0);
});

test("recognizes value-combo products without breaking their product route", () => {
  const bundleProduct = { slug: "daily-wellness-combo", itemType: "PRODUCT", category: { slug: "value-combos" } };
  assert.equal(getCatalogType(bundleProduct), "combo");
  assert.equal(catalogItemPath(bundleProduct), "/products/daily-wellness-combo");
  assert.equal(catalogItemPath({ slug: "curated", itemType: "COMBO" }), "/combos/curated");
});
