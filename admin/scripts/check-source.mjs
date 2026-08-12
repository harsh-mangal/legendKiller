import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const errors = [];
let modules = 0;

const walk = (directory) => {
  const output = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...walk(full));
    else if (/\.(js|jsx)$/.test(entry.name)) output.push(full);
  }
  return output;
};

const resolveRelative = (from, specifier) => {
  const base = path.resolve(path.dirname(from), specifier);
  return [base, `${base}.js`, `${base}.jsx`, path.join(base, "index.js"), path.join(base, "index.jsx")].some(fs.existsSync);
};

const forbidden = [
  [/\bVITE_API_URL\b/g, "Use VITE_API_BASE_URL consistently."],
  [/https?:\/\/api\.ameykaveda\.com/g, "Do not hard-code the production API."],
  [/\balert\s*\(/g, "Use the shared toast system instead of alert()."],
  [/window\.confirm\s*\(/g, "Use ConfirmDialog instead of window.confirm()."],
  [/window\.prompt\s*\(/g, "Use a managed modal instead of window.prompt()."],
  [/fetch\s*\(/g, "Use the shared API client instead of raw fetch()."],
  [/\?admin=true/g, "Use protected /admin/all endpoints."],
  [/\bAmyeka\b/g, "Brand spelling must be Ameyka."],
];

for (const file of walk(srcRoot)) {
  modules += 1;
  const source = fs.readFileSync(file, "utf8");
  for (const [pattern, message] of forbidden) {
    if (pattern.test(source)) errors.push(`${path.relative(root, file)}: ${message}`);
    pattern.lastIndex = 0;
  }
  const imports = /(?:import\s+(?:[^'";]+?\s+from\s+)?|export\s+[^'";]*?\s+from\s+|import\s*\()(["'])(\.[^"']+)\1/g;
  let match;
  while ((match = imports.exec(source))) {
    if (!resolveRelative(file, match[2])) errors.push(`${path.relative(root, file)}: unresolved import ${match[2]}`);
  }
}

const app = fs.readFileSync(path.join(srcRoot, "App.jsx"), "utf8");
const requiredRoutes = ["products", "inventory", "categories", "combos", "orders", "customers", "reviews", "promotions", "delivery", "enquiries", "banners", "testimonials", "articles", "ameyka-coins", "operations"];
for (const route of requiredRoutes) if (!app.includes(`path=\"${route}\"`)) errors.push(`src/App.jsx: missing route /${route}`);

const endpointRequirements = {
  "src/pages/Dashboard.jsx": ["/admin/dashboard"],
  "src/pages/Products.jsx": ["/products/admin/all", "/categories/admin/all"],
  "src/pages/Inventory.jsx": ["/products/admin/all", "/products/"],
  "src/pages/Categories.jsx": ["/categories/admin/all", "/categories"],
  "src/pages/Combos.jsx": ["/combos/admin/all", "/combos"],
  "src/pages/Orders.jsx": ["/orders?", "/invoice", "/status", "/returns/"],
  "src/pages/Customers.jsx": ["/admin/users-wallet-cart", "/block"],
  "src/pages/Promotions.jsx": ["/promotions/admin"],
  "src/pages/Delivery.jsx": ["/delivery/admin/settings"],
  "src/pages/Enquiries.jsx": ["/contact/admin"],
  "src/pages/Banners.jsx": ["/banners/admin/all", "/toggle-status"],
  "src/pages/Testimonials.jsx": ["/testimonials/admin/all", "/testimonials"],
  "src/pages/Articles.jsx": ["/blogs/admin/all", "/blogs"],
  "src/pages/Reviews.jsx": ["/products/admin/all", "/reviews/"],
  "src/pages/CoinSettings.jsx": ["/amyeka-coins/setting"],
  "src/pages/Operations.jsx": ["/health", "/ready", "/admin/dashboard"],
};
for (const [relative, endpoints] of Object.entries(endpointRequirements)) {
  const source = fs.readFileSync(path.join(root, relative), "utf8");
  for (const endpoint of endpoints) if (!source.includes(endpoint)) errors.push(`${relative}: missing required API contract ${endpoint}`);
}

for (const required of [".env.example", "public/_redirects", "ADMIN_COMPATIBILITY.md", "ADMIN_IMPLEMENTATION_SUMMARY.md", "DEPLOYMENT.md"]) {
  if (!fs.existsSync(path.join(root, required))) errors.push(`Missing ${required}`);
}

console.log(`Validated ${modules} admin source modules.`);
if (errors.length) {
  console.error(`\n${errors.length} validation issue(s):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log("Admin route, import, branding and API contract checks passed.");
