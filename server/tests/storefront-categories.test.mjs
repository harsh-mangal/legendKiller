import assert from "node:assert/strict";
import test from "node:test";

import { storefrontCategories } from "../src/services/storefrontCategoryService.js";

test("the storefront exposes only the current pre-workout category", () => {
  assert.deepEqual(
    storefrontCategories.map(({ name, slug }) => ({ name, slug })),
    [
      { name: "Pre-Workout", slug: "pre-workout-energy" },
    ]
  );
});

test("required storefront categories are active and have descriptions", () => {
  for (const category of storefrontCategories) {
    assert.equal(category.isActive, true);
    assert.ok(category.description.length > 20);
  }
});
