import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Combo from "../models/Combo.js";
import Blog from "../models/Blog.js";

const SITE_URL = String(process.env.FRONTEND_URL || "https://legendbornnutrition.com").replace(/\/$/, "");

const STATIC_ROUTES = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/products", changefreq: "daily", priority: "0.9" },
  { path: "/categories", changefreq: "weekly", priority: "0.8" },
  { path: "/articles", changefreq: "daily", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/faq", changefreq: "monthly", priority: "0.6" },
  { path: "/policies/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/policies/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/policies/shipping", changefreq: "yearly", priority: "0.3" },
  { path: "/policies/refund", changefreq: "yearly", priority: "0.3" },
];

const formatDate = (date) => {
  try {
    const d = new Date(date || Date.now());
    return isNaN(d.getTime()) ? new Date().toISOString().split("T")[0] : d.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
};

const escapeXml = (unsafe) =>
  String(unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const getDynamicSitemap = async (req, res, next) => {
  try {
    const [products, categories, combos, blogs] = await Promise.all([
      Product.find({ isActive: true }).select("slug updatedAt images").lean(),
      Category.find({ isActive: true }).select("slug updatedAt").lean(),
      Combo.find({ isActive: true }).select("slug updatedAt").lean(),
      Blog.find({ isPublished: true }).select("slug updatedAt publishedAt coverImage imageAlt").lean(),
    ]);

    const urlEntries = [];

    // 1. Static Pages
    STATIC_ROUTES.forEach((route) => {
      urlEntries.push(`  <url>
    <loc>${escapeXml(`${SITE_URL}${route.path}`)}</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`);
    });

    // 2. Products
    products.forEach((p) => {
      if (!p.slug) return;
      const imgTag = p.images?.[0]
        ? `\n    <image:image>\n      <image:loc>${escapeXml(p.images[0])}</image:loc>\n    </image:image>`
        : "";
      urlEntries.push(`  <url>
    <loc>${escapeXml(`${SITE_URL}/products/${p.slug}`)}</loc>
    <lastmod>${formatDate(p.updatedAt)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>${imgTag}
  </url>`);
    });

    // 3. Categories
    categories.forEach((c) => {
      if (!c.slug) return;
      urlEntries.push(`  <url>
    <loc>${escapeXml(`${SITE_URL}/categories/${c.slug}`)}</loc>
    <lastmod>${formatDate(c.updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    });

    // 4. Combos / Stacks
    combos.forEach((cb) => {
      if (!cb.slug) return;
      urlEntries.push(`  <url>
    <loc>${escapeXml(`${SITE_URL}/combos/${cb.slug}`)}</loc>
    <lastmod>${formatDate(cb.updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    });

    // 5. Articles
    blogs.forEach((b) => {
      if (!b.slug) return;
      const imgTag = b.coverImage
        ? `\n    <image:image>\n      <image:loc>${escapeXml(b.coverImage)}</image:loc>\n    </image:image>`
        : "";
      urlEntries.push(`  <url>
    <loc>${escapeXml(`${SITE_URL}/articles/${b.slug}`)}</loc>
    <lastmod>${formatDate(b.updatedAt || b.publishedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imgTag}
  </url>`);
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries.join("\n")}
</urlset>`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    return res.status(200).send(xml);
  } catch (error) {
    next(error);
  }
};
