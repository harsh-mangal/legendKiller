import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import path from "node:path";
import express from "express";
import sharp from "sharp";
import Product from "../src/models/Product.js";
import Architecture from "../src/models/Architecture.js";
import StorefrontSetting from "../src/models/StorefrontSetting.js";
import { updateProduct } from "../src/controllers/productController.js";
import { createArchitecture, updateArchitecture } from "../src/controllers/architectureController.js";
import { getArticleSettings, updateArticleSettings } from "../src/controllers/storefrontSettingController.js";
import { upload, uploadProductMedia } from "../src/middleware/uploadMiddleware.js";

const routeServer = async (t, configure) => {
  const app = express();
  app.use(express.json());
  configure(app);
  app.use((error, req, res, next) => res.status(error.statusCode || 400).json({ message: error.message }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => { server.closeAllConnections(); return new Promise((resolve) => server.close(resolve)); });
  return `http://127.0.0.1:${server.address().port}`;
};

const image = async () => new Blob([await sharp({ create: { width: 8, height: 8, channels: 3, background: "#ff5500" } }).png().toBuffer()], { type: "image/png" });
const filePath = (url) => path.join(process.cwd(), url.slice(1));
const cleanFile = (t, url) => t.after(() => fs.rm(filePath(url), { force: true }));
const productRecord = (t) => {
  const product = new Product({ name: "Test product", slug: "test-product", category: "507f1f77bcf86cd799439011", description: "Product details", price: 99, mrp: 99 });
  t.mock.method(Product, "findById", async () => product);
  t.mock.method(product, "save", async () => product);
  t.mock.method(product, "populate", async () => product);
  return product;
};

test("nutrition text, image and PDF survive a multipart product update and independent removal", async (t) => {
  const product = productRecord(t);
  const base = await routeServer(t, (app) => app.put("/product", uploadProductMedia, updateProduct));
  const body = new FormData();
  body.append("nutritionText", "Serving size: 24 g\nSodium: 47 mg");
  body.append("nutritionGraphic", await image(), "label.png");
  body.append("nutritionPdf", new Blob(["%PDF-1.4\nNutrition table\n%%EOF"], { type: "application/pdf" }), "label.pdf");
  const response = await fetch(`${base}/product`, { method: "PUT", body });
  assert.equal(response.status, 200);
  const saved = (await response.json()).data;
  cleanFile(t, saved.nutritionPdf);
  cleanFile(t, saved.nutritionGraphic);
  assert.equal(saved.nutritionText.replace(/\r\n/g, "\n"), "Serving size: 24 g\nSodium: 47 mg");
  assert.match(saved.nutritionPdf, /^\/uploads\/product-nutrition\/.*\.pdf$/);
  assert.match(saved.nutritionGraphic, /^\/uploads\/product-nutrition\/.*\.webp$/);
  assert.equal((await fs.readFile(filePath(saved.nutritionPdf))).subarray(0, 5).toString(), "%PDF-");
  const removal = new FormData();
  removal.append("clearNutritionPdf", "true");
  const removed = await fetch(`${base}/product`, { method: "PUT", body: removal });
  assert.equal(removed.status, 200);
  assert.equal(product.nutritionPdf, "");
  assert.equal(product.nutritionGraphic, saved.nutritionGraphic);
  assert.equal(product.nutritionText, saved.nutritionText);
  await assert.rejects(fs.access(filePath(saved.nutritionPdf)), { code: "ENOENT" });
});

test("a renamed non-PDF is rejected without saving the product", async (t) => {
  const product = productRecord(t);
  const base = await routeServer(t, (app) => app.put("/product", uploadProductMedia, updateProduct));
  const body = new FormData();
  body.append("nutritionPdf", new Blob(["not a PDF"], { type: "application/pdf" }), "label.pdf");
  const response = await fetch(`${base}/product`, { method: "PUT", body });
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /valid PDF/);
  assert.equal(product.save.mock.callCount(), 0);
});

test("architecture uploads persist with nested content and JSON-only updates keep the image", async (t) => {
  const architecture = { title: "Architecture", slug: "test-architecture", logoUrl: "", save: async () => {} };
  t.mock.method(Architecture, "findOne", async () => null);
  t.mock.method(Architecture, "create", async (payload) => Object.assign(architecture, payload));
  t.mock.method(Architecture, "findById", async () => architecture);
  const base = await routeServer(t, (app) => {
    app.post("/architecture", upload.single("image"), createArchitecture);
    app.put("/architecture/:id", upload.single("image"), updateArchitecture);
  });
  const body = new FormData();
  body.append("payload", JSON.stringify({ title: "Architecture", slug: "test-architecture", pillars: [{ name: "Power" }], chapters: [{ number: 1, title: "Introduction", content: "Full content" }], isActive: false }));
  body.append("image", await image(), "architecture.png");
  const created = await fetch(`${base}/architecture`, { method: "POST", body });
  assert.equal(created.status, 201);
  const logo = architecture.logoUrl;
  cleanFile(t, logo);
  assert.match(logo, /^\/uploads\/architectures\/.*\.webp$/);
  await fs.access(filePath(logo));
  assert.equal(architecture.isActive, false);
  assert.equal(architecture.chapters[0].content, "Full content");
  assert.equal(architecture.contentVersion, 1);
  const updated = await fetch(`${base}/architecture/123`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subtitle: "Updated subtitle" }) });
  assert.equal(updated.status, 200);
  assert.equal(architecture.logoUrl, logo);
  assert.equal(architecture.subtitle, "Updated subtitle");
  const replacement = new FormData();
  replacement.append("payload", JSON.stringify({ title: "Updated architecture" }));
  replacement.append("image", await image(), "replacement.png");
  assert.equal((await fetch(`${base}/architecture/123`, { method: "PUT", body: replacement })).status, 200);
  cleanFile(t, architecture.logoUrl);
  assert.notEqual(architecture.logoUrl, logo);
  await assert.rejects(fs.access(filePath(logo)), { code: "ENOENT" });
});

test("article banner uploads can be read and removed without changing homepage settings", async (t) => {
  let setting = { key: "articles", aboutLegendSlayerBanner: "" };
  t.mock.method(StorefrontSetting, "findOne", () => ({ ...setting, lean: async () => setting }));
  t.mock.method(StorefrontSetting, "findOneAndUpdate", async (filter, update) => {
    assert.deepEqual(filter, { key: "articles" });
    assert.deepEqual(Object.keys(update.$set), ["aboutLegendSlayerBanner"]);
    setting = { ...setting, ...update.$set };
    return setting;
  });
  const base = await routeServer(t, (app) => {
    app.get("/articles", getArticleSettings);
    app.put("/articles", upload.single("banner"), updateArticleSettings);
  });
  const body = new FormData();
  body.append("banner", await image(), "banner.png");
  const saved = await fetch(`${base}/articles`, { method: "PUT", body });
  assert.equal(saved.status, 200);
  const banner = (await saved.json()).data.aboutLegendSlayerBanner;
  cleanFile(t, banner);
  assert.match(banner, /^\/uploads\/article-banners\/.*\.webp$/);
  const read = await fetch(`${base}/articles`);
  assert.equal((await read.json()).data.aboutLegendSlayerBanner, banner);
  const removal = new FormData();
  removal.append("clearBanner", "true");
  const removed = await fetch(`${base}/articles`, { method: "PUT", body: removal });
  assert.equal((await removed.json()).data.aboutLegendSlayerBanner, "");
  await assert.rejects(fs.access(filePath(banner)), { code: "ENOENT" });
});
