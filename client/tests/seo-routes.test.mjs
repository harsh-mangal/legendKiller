import test from "node:test";
import assert from "node:assert/strict";
import {
  STATIC_INDEXABLE_ROUTES,
  STATIC_NOINDEX_ROUTES,
  getRouteSeo,
} from "../src/config/seoRoutes.js";

test("indexable routes use unique canonical paths", () => {
  const paths = STATIC_INDEXABLE_ROUTES.map((route) => route.path);
  assert.equal(new Set(paths).size, paths.length);
  for (const route of STATIC_INDEXABLE_ROUTES) {
    const meta = getRouteSeo(route.path);
    assert.equal(meta.indexable, true);
    assert.equal(meta.canonicalPath, route.path);
    assert.ok(meta.title.length > 10);
    assert.ok(meta.description.length > 40);
  }
});

test("faceted catalogue URLs consolidate to the main catalogue", () => {
  const meta = getRouteSeo("/products", "?search=ashwagandha&page=2");
  assert.equal(meta.indexable, false);
  assert.equal(meta.canonicalPath, "/products");
});

test("customer and checkout routes are noindex", () => {
  for (const pathname of STATIC_NOINDEX_ROUTES) {
    assert.equal(getRouteSeo(pathname).indexable, false, pathname);
  }
  assert.equal(getRouteSeo("/orders/order-123").indexable, false);
});

test("public content detail patterns remain indexable", () => {
  assert.equal(getRouteSeo("/products/sample-product").kind, "product");
  assert.equal(getRouteSeo("/categories/digestive-care").kind, "category");
  assert.equal(getRouteSeo("/combos/sample-combo").kind, "combo");
  assert.equal(getRouteSeo("/articles/sample-article").kind, "article");
});

test("unknown routes are noindex", () => {
  const meta = getRouteSeo("/not-a-real-page");
  assert.equal(meta.indexable, false);
  assert.equal(meta.kind, "not-found");
});
