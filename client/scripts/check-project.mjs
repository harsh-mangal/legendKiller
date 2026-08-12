import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceRoot = path.join(root, "src");
const extensions = new Set([".js", ".jsx", ".mjs", ".css", ".html", ".json"]);
const failures = [];

const walk = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return extensions.has(path.extname(entry.name)) ? [fullPath] : [];
  });

const files = [...walk(sourceRoot), path.join(root, "index.html")];
const forbidden = [
  [/(^|\W)Amyeka(\W|$)/g, "incorrect brand spelling 'Amyeka'"],
  [/\b(?:dummy|mock|fallbackData)\b/gi, "dummy/mock data reference"],
  [/\b(?:text-terra|text-muted|bg-leaf|text-leaf|border-gold|bg-paper|text-cream)\b/g, "legacy theme utility"],
  [/#(?:4E542D|F7F4EB|F5F0E6)/gi, "legacy hard-coded theme color"],
  [/HomeCarousel/g, "deleted duplicate carousel reference"],
  [/console\.log\s*\(/g, "console.log statement"],
];

for (const file of files) {
  const relative = path.relative(root, file);
  const content = fs.readFileSync(file, "utf8");
  for (const [pattern, label] of forbidden) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) failures.push(`${relative}: ${label}`);
  }
}

const importPattern = /(?:import\s+(?:[^"']+?\s+from\s+)?|import\s*\(|export\s+[^"']*?from\s+)["'](\.{1,2}\/[^"']+)["']/g;
const sourceFiles = walk(sourceRoot).filter((file) => /\.(?:js|jsx|mjs)$/.test(file));
const candidatesFor = (base) => [
  base,
  `${base}.js`,
  `${base}.jsx`,
  `${base}.mjs`,
  path.join(base, "index.js"),
  path.join(base, "index.jsx"),
];

for (const file of sourceFiles) {
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(importPattern)) {
    const resolved = path.resolve(path.dirname(file), match[1]);
    if (!candidatesFor(resolved).some((candidate) => fs.existsSync(candidate))) {
      failures.push(`${path.relative(root, file)}: unresolved import ${match[1]}`);
    }
  }
}

for (const jsonFile of ["package.json", "package-lock.json", "public/manifest.json"]) {
  try {
    JSON.parse(fs.readFileSync(path.join(root, jsonFile), "utf8"));
  } catch (error) {
    failures.push(`${jsonFile}: invalid JSON (${error.message})`);
  }
}

if (failures.length) {
  console.error("Project source checks failed:\n" + failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`Project source checks passed (${sourceFiles.length} JavaScript/JSX modules checked).`);
