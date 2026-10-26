import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceRoot = path.join(root, "src");
const errors = [];

const walk = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return /\.(?:js|jsx|mjs)$/.test(entry.name) ? [fullPath] : [];
  });

const sourceFiles = walk(sourceRoot);
const candidatesFor = (base) => [
  base,
  `${base}.js`,
  `${base}.jsx`,
  `${base}.mjs`,
  path.join(base, "index.js"),
  path.join(base, "index.jsx"),
];

const importPattern = /(?:import\s+(?:[^"']+?\s+from\s+)?|import\s*\(|export\s+[^"']*?from\s+)["'](\.{1,2}\/[^"']+)["']/g;
const forbidden = [
  [/\balert\s*\(/g, "Use the shared toast system instead of alert()."],
  [/window\.(?:confirm|prompt)\s*\(/g, "Use a managed dialog instead of a browser prompt."],
  [/\bVITE_API_URL\b/g, "Use VITE_API_BASE_URL consistently."],
  [/https?:\/\/(?:localhost|127\.0\.0\.1):\d+\/api/g, "Do not hard-code a local API URL."],
];

for (const file of sourceFiles) {
  const relative = path.relative(root, file);
  const source = fs.readFileSync(file, "utf8");

  for (const [pattern, message] of forbidden) {
    pattern.lastIndex = 0;
    if (pattern.test(source)) errors.push(`${relative}: ${message}`);
  }

  for (const match of source.matchAll(importPattern)) {
    const resolved = path.resolve(path.dirname(file), match[1]);
    if (!candidatesFor(resolved).some((candidate) => fs.existsSync(candidate))) {
      errors.push(`${relative}: unresolved import ${match[1]}`);
    }
  }
}

const appSource = fs.readFileSync(path.join(sourceRoot, "App.jsx"), "utf8");
const requiredRoutes = [
  "products", "inventory", "categories", "combos", "orders", "customers",
  "reviews", "promotions", "delivery", "enquiries", "partner-inquiries",
  "banners", "testimonials", "articles", "architectures", "patents",
  "ameyka-coins", "operations",
];
for (const route of requiredRoutes) {
  if (!appSource.includes(`path="${route}"`)) errors.push(`src/App.jsx: missing route /${route}`);
}

for (const jsonFile of ["package.json", "package-lock.json", "public/manifest.json"]) {
  try {
    JSON.parse(fs.readFileSync(path.join(root, jsonFile), "utf8"));
  } catch (error) {
    errors.push(`${jsonFile}: invalid JSON (${error.message})`);
  }
}

if (errors.length) {
  console.error(`Admin source checks failed:\n${errors.map((item) => `- ${item}`).join("\n")}`);
  process.exit(1);
}

console.log(`Admin source checks passed (${sourceFiles.length} JavaScript/JSX modules checked).`);
