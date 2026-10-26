import assert from "node:assert/strict";
import fs from "node:fs";
import {
  couponCodeIsValid,
  endOfInputDateIso,
  intersect,
  isFiniteNumber,
  isWholeNumber,
  startOfInputDateIso,
  validateIndianPincodes,
  validateImageFiles,
  validateVideoFiles,
} from "../src/utils/validation.js";

assert.equal(isFiniteNumber("12.5"), true);
assert.equal(isFiniteNumber("not-a-number"), false);
assert.equal(isWholeNumber("3"), true);
assert.equal(isWholeNumber("3.2"), false);
assert.equal(couponCodeIsValid("WELCOME10"), true);
assert.equal(couponCodeIsValid("NO SPACE"), false);
assert.deepEqual(validateIndianPincodes(["110001", "110001", "012345", "abc"]).normalized, ["110001", "012345", "abc"]);
assert.deepEqual(validateIndianPincodes(["110001", "012345", "abc"]).invalid, ["012345", "abc"]);
assert.deepEqual(intersect(["110001", "302016"], ["302016", "160017"]), ["302016"]);
assert.match(startOfInputDateIso("2026-08-02"), /^2026-08-01T18:30:00\.000Z$|^2026-08-02T00:00:00\.000Z$/);
assert.ok(new Date(endOfInputDateIso("2026-08-02")) > new Date(startOfInputDateIso("2026-08-02")));
assert.equal(validateImageFiles([{ name: "a.jpg", type: "image/jpeg", size: 1024 }]), "");
assert.match(validateImageFiles([{ name: "a.svg", type: "image/svg+xml", size: 1024 }]), /JPG, PNG or WEBP/);
assert.equal(validateVideoFiles([{ name: "demo.mp4", type: "video/mp4", size: 1024 }]), "");
assert.match(validateVideoFiles([{ name: "demo.avi", type: "video/x-msvideo", size: 1024 }]), /MP4, WEBM or MOV/);
assert.match(validateVideoFiles([{ name: "large.mp4", type: "video/mp4", size: 11 * 1024 * 1024 }]), /smaller than 10 MB/);

const sharedUiSource = fs.readFileSync(new URL("../src/components/ui/index.jsx", import.meta.url), "utf8");
assert.match(sharedUiSource, /const onCloseRef = useRef\(onClose\)/);
assert.match(sharedUiSource, /\}, \[open\]\);/);
assert.doesNotMatch(sharedUiSource, /\[open, onClose\]/);

const apiClientSource = fs.readFileSync(new URL("../src/api/axios.js", import.meta.url), "utf8");
assert.match(apiClientSource, /https:\/\/api\.legendbornnutrition\.com\/api/);

const ordersSource = fs.readFileSync(new URL("../src/pages/Orders.jsx", import.meta.url), "utf8");
assert.match(ordersSource, /const closingOrderRef = useRef\(false\)/);
assert.match(ordersSource, /detailRequestRef\.current \+= 1/);
assert.match(ordersSource, /next\.delete\("open"\)/);

console.log("Admin business-rule tests passed.");
