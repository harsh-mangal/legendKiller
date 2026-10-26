import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";

import Product from "../src/models/Product.js";
import { planProductImageUpdate } from "../src/utils/productImages.js";

const baseProduct = () => ({
  name: "Media-ready product",
  slug: "media-ready-product",
  category: new mongoose.Types.ObjectId(),
  description: "A complete product description.",
  price: 499,
  mrp: 599,
});

test("products remain valid without optional description media", async () => {
  const product = new Product(baseProduct());
  await product.validate();
  assert.equal(product.aboutGraphic, "");
  assert.deepEqual(product.infographics, []);
  assert.deepEqual(product.videos, []);
});

test("products accept structured infographic and video records", async () => {
  const product = new Product({
    ...baseProduct(),
    aboutGraphic: "/uploads/product-about/about.webp",
    infographics: [{ url: "/uploads/product-infographics/guide.webp", altText: "Usage guide" }],
    videos: [{ url: "/uploads/product-videos/demo.mp4", title: "Product demonstration" }],
  });
  await product.validate();
  assert.equal(product.aboutGraphic, "/uploads/product-about/about.webp");
  assert.equal(product.infographics[0].altText, "Usage guide");
  assert.equal(product.videos[0].title, "Product demonstration");
});

test("product image updates retain and remove the exact requested images", () => {
  const plan = planProductImageUpdate({
    currentImages: ["/uploads/products/one.webp", "/uploads/products/two.webp"],
    retainedImagesValue: JSON.stringify(["/uploads/products/two.webp"]),
    newImageCount: 1,
  });

  assert.equal(plan.shouldUpdate, true);
  assert.deepEqual(plan.retainedImages, ["/uploads/products/two.webp"]);
  assert.deepEqual(plan.removedImages, ["/uploads/products/one.webp"]);
});

test("legacy product updates append images without deleting the current gallery", () => {
  const plan = planProductImageUpdate({
    currentImages: ["/uploads/products/one.webp"],
    newImageCount: 1,
  });

  assert.deepEqual(plan.retainedImages, ["/uploads/products/one.webp"]);
  assert.deepEqual(plan.removedImages, []);
});

test("product image updates reject foreign retained image URLs", () => {
  assert.throws(() => planProductImageUpdate({
    currentImages: ["/uploads/products/one.webp"],
    retainedImagesValue: JSON.stringify(["/uploads/products/another.webp"]),
  }), /do not belong to this product/);
});

test("product image updates allow seven images and enforce the ten-image gallery limit", () => {
  const allowed = planProductImageUpdate({
    currentImages: Array.from({ length: 6 }, (_, index) => `/uploads/products/${index}.webp`),
    newImageCount: 1,
  });
  assert.equal(allowed.retainedImages.length + 1, 7);

  assert.throws(() => planProductImageUpdate({
    currentImages: Array.from({ length: 10 }, (_, index) => `/uploads/products/${index}.webp`),
    newImageCount: 1,
  }), /no more than 10 images/);
});

test("product records enforce the ten-image gallery limit", async () => {
  const allowed = new Product({
    ...baseProduct(),
    images: Array.from({ length: 10 }, (_, index) => `/uploads/products/${index}.webp`),
  });
  await allowed.validate();

  const oversized = new Product({
    ...baseProduct(),
    slug: "oversized-product-gallery",
    images: Array.from({ length: 11 }, (_, index) => `/uploads/products/${index}.webp`),
  });
  await assert.rejects(() => oversized.validate(), /no more than 10 images/);
});
