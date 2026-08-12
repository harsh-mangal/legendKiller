import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { STATIC_INDEXABLE_ROUTES, STATIC_NOINDEX_ROUTES } from "../src/config/seoRoutes.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const failures = [];

const read = (filename) => readFile(filename, "utf8");
const decodeXml = (value) => value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
const getAttribute = (html, selectorPattern, attribute = "content") => {
  const expression = new RegExp(`<${selectorPattern}[^>]*\\s${attribute}="([^"]*)"[^>]*>`, "i");
  return html.match(expression)?.[1] || "";
};

const sitemap = await read(path.join(root, "public", "sitemap.xml"));
const robots = await read(path.join(root, "public", "robots.txt"));
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
  .map((match) => decodeXml(match[1]))
  .filter((value) => !value.includes("/uploads/"));

if (urls.length < STATIC_INDEXABLE_ROUTES.length) failures.push("Sitemap is missing static routes.");
if (new Set(urls).size !== urls.length) failures.push("Sitemap contains duplicate page URLs.");
if (!robots.includes("Sitemap: https://legendbornnutrition.com/sitemap.xml")) failures.push("robots.txt does not reference the canonical sitemap.");

const titles = new Map();
for (const value of urls) {
  const url = new URL(value);
  if (url.origin !== "https://legendbornnutrition.com") failures.push(`Non-canonical sitemap origin: ${value}`);
  if (url.search || url.hash) failures.push(`Sitemap URL contains query or fragment: ${value}`);
  const pathname = decodeURIComponent(url.pathname);
  const target = pathname === "/" ? path.join(dist, "index.html") : path.join(dist, pathname.replace(/^\//, ""), "index.html");
  const cleanUrlTarget = pathname === "/" ? target : path.join(dist, `${pathname.replace(/^\//, "")}.html`);
  let html = "";
  try { html = await read(target); } catch { failures.push(`Missing generated HTML: ${pathname}`); continue; }
  try { await stat(cleanUrlTarget); } catch { failures.push(`Missing clean-URL HTML: ${pathname}`); }

  const title = html.match(/<title>(.*?)<\/title>/is)?.[1]?.trim() || "";
  const description = getAttribute(html, 'meta name="description"');
  const robotsMeta = getAttribute(html, 'meta name="robots"');
  const canonical = getAttribute(html, 'link rel="canonical"', "href");
  const ogImage = getAttribute(html, 'meta property="og:image"');
  if (!title) failures.push(`Missing title: ${pathname}`);
  if (title && titles.has(title)) failures.push(`Duplicate title: ${title} (${titles.get(title)}, ${pathname})`);
  titles.set(title, pathname);
  if (description.length < 40 || description.length > 180) failures.push(`Description length is invalid: ${pathname}`);
  if (!robotsMeta.startsWith("index,follow")) failures.push(`Indexable route is not index,follow: ${pathname}`);
  if (canonical !== value) failures.push(`Canonical mismatch: ${pathname} -> ${canonical}`);
  if (!ogImage.startsWith("https://")) failures.push(`Missing absolute social image: ${pathname}`);
  if (!html.includes('<div id="root"><main')) failures.push(`Missing static route content: ${pathname}`);
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); } catch { failures.push(`Invalid JSON-LD: ${pathname}`); }
  }
}

for (const pathname of STATIC_NOINDEX_ROUTES) {
  const target = path.join(dist, pathname.replace(/^\//, ""), "index.html");
  try {
    const html = await read(target);
    if (!getAttribute(html, 'meta name="robots"').startsWith("noindex,follow")) failures.push(`Private route is not noindex: ${pathname}`);
  } catch {
    failures.push(`Missing private route HTML: ${pathname}`);
  }
}

try {
  const socialImage = await stat(path.join(root, "public", "og-social.jpg"));
  if (socialImage.size > 500_000) failures.push("Social image is larger than 500 KB.");
} catch {
  failures.push("Social image is missing.");
}

if (failures.length) {
  console.error(`SEO validation failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`SEO validation passed for ${urls.length} canonical pages and ${STATIC_NOINDEX_ROUTES.length} private routes.`);
