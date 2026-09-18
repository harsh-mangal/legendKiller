import assert from "node:assert/strict";
import test from "node:test";

import Banner from "../src/models/bannerModel.js";

const baseBanner = () => ({
  page: "categories",
  image: "/uploads/banners/pre-workout.webp",
  mobileImage: "/uploads/banners/pre-workout-mobile.webp",
});

test("category banners accept and normalize a category slug", async () => {
  const banner = new Banner({ ...baseBanner(), categorySlug: "Pre-Workout-Energy" });
  await banner.validate();
  assert.equal(banner.categorySlug, "pre-workout-energy");
});

test("generic category banners remain valid without an assignment", async () => {
  const banner = new Banner(baseBanner());
  await banner.validate();
  assert.equal(banner.categorySlug, "");
});

test("category banners reject invalid category slugs", async () => {
  const banner = new Banner({ ...baseBanner(), categorySlug: "pre workout" });
  await assert.rejects(() => banner.validate(), /Category slug/);
});
