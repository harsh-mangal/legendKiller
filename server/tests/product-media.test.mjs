import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";

import Product from "../src/models/Product.js";

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
  assert.deepEqual(product.infographics, []);
  assert.deepEqual(product.videos, []);
});

test("products accept structured infographic and video records", async () => {
  const product = new Product({
    ...baseProduct(),
    infographics: [{ url: "/uploads/product-infographics/guide.webp", altText: "Usage guide" }],
    videos: [{ url: "/uploads/product-videos/demo.mp4", title: "Product demonstration" }],
  });
  await product.validate();
  assert.equal(product.infographics[0].altText, "Usage guide");
  assert.equal(product.videos[0].title, "Product demonstration");
});
