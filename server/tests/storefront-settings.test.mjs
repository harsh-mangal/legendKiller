import assert from "node:assert/strict";
import test from "node:test";

import StorefrontSetting from "../src/models/StorefrontSetting.js";

test("the Shop more together shelf is active by default", async () => {
  const setting = new StorefrontSetting();
  await setting.validate();
  assert.equal(setting.key, "homepage");
  assert.equal(setting.shopMoreTogetherActive, true);
});

test("the Shop more together shelf can be disabled", async () => {
  const setting = new StorefrontSetting({ shopMoreTogetherActive: false });
  await setting.validate();
  assert.equal(setting.shopMoreTogetherActive, false);
});
