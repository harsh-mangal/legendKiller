import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  if (entry.isDirectory()) return entry.name === "node_modules" ? [] : walk(full);
  return /\.(js|mjs)$/.test(entry.name) ? [full] : [];
});

const files = [...walk(path.join(root, "src")), ...walk(path.join(root, "scripts")), ...walk(path.join(root, "tests"))];
for (const file of files) execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });

const sources = Object.fromEntries(files.map((file) => [path.relative(root, file), fs.readFileSync(file, "utf8")]));
const allSource = Object.values(sources).join("\n");
const scannedSource = Object.entries(sources)
  .filter(([file]) => file !== "scripts/check-project.mjs")
  .map(([, source]) => source)
  .join("\n");
const requiredSnippets = [
  'router.post("/forgot-password"', 'router.post("/reset-password"',
  'router.get("/:id"', 'router.post("/track"', 'router.post("/:id/retry-payment"',
  'router.post("/:id/cancel"', 'router.post("/:id/returns"', 'router.get("/:id/invoice"',
  'router.get("/", listAddresses)', 'router.post("/", createAddress)', 'router.put("/:id/default"',
  'router.post("/validate"', 'router.get("/check"',
  'app.use("/api/addresses"', 'app.use("/api/promotions"', 'app.use("/api/delivery"',
  'app.post("/api/orders/razorpay/webhook"', 'app.get("/health"', 'app.get("/ready"',
];
const missing = requiredSnippets.filter((snippet) => !allSource.includes(snippet));
if (missing.length) throw new Error(`Missing compatibility markers:\n${missing.join("\n")}`);

const banned = ["dummyTestimonials", "dummyBlogs", 'req.query.admin === "true"', 'includeInactive === "true"'];
const foundBanned = banned.filter((value) => scannedSource.includes(value));
if (foundBanned.length) throw new Error(`Unsafe or dummy source remains: ${foundBanned.join(", ")}`);

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (packageJson.name !== "ameyka-veda-ecommerce-backend") throw new Error("Package name is not standardised");
console.log(`Project check passed: ${files.length} JavaScript modules, route compatibility markers present, no dummy source.`);
