import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { normalizePromotionPayload } from "../src/controllers/promotionController.js";

const readSource = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("admin product listing keeps inactive products and unmoderated reviews visible", async () => {
  const source = await readSource("../src/controllers/productController.js");
  assert.match(source, /const query = adminView \? \{\} : \{ isActive: true \}/);
  assert.match(source, /data: adminView \? products : products\.map\(publicProduct\)/);
});

test("product archive is recoverable and does not hard-delete the record", async () => {
  const source = await readSource("../src/controllers/productController.js");
  const archiveHandler = source.slice(source.indexOf("export const deleteProduct"), source.indexOf("export const addProductReview"));
  assert.match(archiveHandler, /findByIdAndUpdate\(req\.params\.id, \{ isActive: false \}/);
  assert.doesNotMatch(archiveHandler, /findByIdAndDelete/);
});

test("banner creation requires independent desktop and mobile images", async () => {
  const source = await readSource("../src/controllers/bannerController.js");
  assert.match(source, /if \(!desktopFile \|\| !mobileFile\)/);
});

test("admin order filtering supports a validated customer id", async () => {
  const source = await readSource("../src/controllers/orderController.js");
  assert.match(source, /if \(req\.query\.userId\) \{/);
  assert.match(source, /query\.user = req\.query\.userId/);
});

test("coupon dates and usage limits reject inconsistent values", () => {
  const base = {
    code: "SAVE20",
    discountType: "PERCENTAGE",
    discountValue: 20,
  };

  assert.throws(
    () => normalizePromotionPayload({ ...base, startsAt: "2026-10-20", endsAt: "2026-10-19" }),
    /cannot be before/,
  );
  assert.throws(
    () => normalizePromotionPayload({ ...base, usageLimit: 2, perUserLimit: 3 }),
    /cannot exceed/,
  );
  assert.throws(
    () => normalizePromotionPayload({ ...base, minOrderValue: -1 }),
    /cannot be negative/,
  );
});
