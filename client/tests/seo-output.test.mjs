import assert from "node:assert/strict";
import test from "node:test";
import { canPrerenderRoute } from "../scripts/seo-output.mjs";

test("static HTML output accounts for filesystem limits and the .html suffix", () => {
  assert.equal(canPrerenderRoute("/"), true);
  assert.equal(canPrerenderRoute(`/articles/${"a".repeat(250)}`), true);
  assert.equal(canPrerenderRoute(`/articles/${"a".repeat(251)}`), false);
  assert.equal(canPrerenderRoute(`/articles/${"é".repeat(126)}`), false);
  assert.equal(canPrerenderRoute(`/articles/${"a".repeat(380)}`), false);
});
