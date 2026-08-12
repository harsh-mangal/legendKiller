import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  STATIC_INDEXABLE_ROUTES,
  STATIC_NOINDEX_ROUTES,
  getRouteSeo,
} from "../src/config/seoRoutes.js";
import { FAQ_ENTRIES } from "../src/content/faq.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const distDir = path.join(root, "dist");
const cacheFile = path.join(root, ".cache", "seo-pages.json");

const readSelectedEnv = async () => {
  const result = {};
  for (const name of [".env", ".env.production"]) {
    try {
      const content = await readFile(path.join(root, name), "utf8");
      for (const line of content.split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (!match || !["VITE_SITE_URL", "VITE_ASSET_BASE_URL", "SITEMAP_API_BASE_URL"].includes(match[1])) continue;
        result[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
      }
    } catch {
      // Environment files are optional in CI.
    }
  }
  return result;
};

const fileEnv = await readSelectedEnv();
const siteUrl = String(process.env.VITE_SITE_URL || fileEnv.VITE_SITE_URL || "https://legendbornnutrition.com").replace(/\/$/, "");
const apiBaseUrl = String(process.env.SITEMAP_API_BASE_URL || process.env.VITE_API_BASE_URL || fileEnv.SITEMAP_API_BASE_URL || "http://localhost:5005/api").replace(/\/$/, "");
const assetBaseUrl = String(process.env.VITE_ASSET_BASE_URL || fileEnv.VITE_ASSET_BASE_URL || apiBaseUrl.replace(/\/api(?:\/v\d+)?\/?$/, "")).replace(/\/$/, "");
const defaultImage = `${siteUrl}/og-social.jpg`;
const defaultImageAlt = "Ameyka Veda — Ayurveda-inspired wellness for modern Indian families";

const absoluteSiteUrl = (pathname = "/") => new URL(pathname, `${siteUrl}/`).toString();
const absoluteAssetUrl = (value) => {
  if (!value) return "";
  if (/^https?:/i.test(value)) return value;
  return `${assetBaseUrl}${String(value).startsWith("/") ? "" : "/"}${value}`;
};

const unwrap = (payload) => {
  let value = payload;
  for (let index = 0; index < 3; index += 1) {
    if (value && typeof value === "object" && "data" in value) value = value.data;
    else break;
  }
  return value;
};

const extractItems = (payload) => {
  const value = unwrap(payload);
  if (Array.isArray(value)) return value;
  for (const key of ["items", "products", "categories", "combos", "blogs", "results"]) {
    if (Array.isArray(value?.[key])) return value[key];
  }
  return [];
};

const fetchJson = async (pathname) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`${apiBaseUrl}${pathname}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`${pathname} returned ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
};

const fetchProducts = async () => {
  const products = [];
  for (let page = 1; page <= 100; page += 1) {
    const payload = await fetchJson(`/products?limit=100&page=${page}&sort=newest`);
    products.push(...extractItems(payload));
    const pages = Number(payload?.pagination?.pages || payload?.data?.pagination?.pages || 1);
    if (page >= pages) break;
  }
  return products;
};

const cleanText = (value, fallback = "") => String(value || fallback).replace(/\s+/g, " ").trim();
const makeDescription = (item, fallback) => cleanText(item.seoDescription || item.excerpt || item.shortDescription || item.description, fallback).slice(0, 180);

const dynamicPages = async () => {
  const results = await Promise.allSettled([
    fetchProducts(),
    fetchJson("/categories").then(extractItems),
    fetchJson("/combos").then(extractItems),
    fetchJson("/blogs").then(extractItems),
  ]);
  const labels = ["products", "categories", "combos", "articles"];
  results.forEach((result, index) => {
    if (result.status === "rejected") console.warn(`SEO ${labels[index]} refresh failed (${result.reason?.message || "unknown error"}).`);
  });
  if (results.every((result) => result.status === "rejected")) throw new Error("All catalogue endpoints failed");
  const [products, categories, combos, articles] = results.map((result) => result.status === "fulfilled" ? result.value : []);

  return [
    ...products.filter((item) => item?.slug).map((item) => ({
      path: `/products/${item.slug}`,
      title: cleanText(item.seoTitle || `${item.name} | Ameyka Veda`),
      description: makeDescription(item, `View ${item.name}, price, pack information and responsible-use details.`),
      type: "product",
      image: absoluteAssetUrl(item.images?.[0]) || defaultImage,
      imageAlt: cleanText(item.name, defaultImageAlt),
      lastmod: item.updatedAt,
      data: {
        name: item.name,
        sku: item.sku,
        brand: item.brand || "Ameyka Veda",
        price: Number(item.price || 0),
        stock: Number(item.availableStock ?? item.stock ?? 0),
        stockKnown: item.availableStock != null || item.stock != null,
        rating: Number(item.rating || 0),
        numReviews: Number(item.numReviews || 0),
        category: item.category?.name,
        categorySlug: item.category?.slug,
      },
    })),
    ...categories.filter((item) => item?.slug).map((item) => ({
      path: `/categories/${item.slug}`,
      title: `${cleanText(item.name)} Products | Ameyka Veda`,
      description: makeDescription(item, `Browse Ameyka Veda products in the ${item.name} category.`),
      type: "category",
      image: absoluteAssetUrl(item.image) || defaultImage,
      imageAlt: cleanText(item.name, defaultImageAlt),
      lastmod: item.updatedAt,
      data: { name: item.name },
    })),
    ...combos.filter((item) => item?.slug).map((item) => ({
      path: `/combos/${item.slug}`,
      title: cleanText(item.seoTitle || `${item.name} Combo Pack | Ameyka Veda`),
      description: makeDescription(item, `View ${item.name}, included products, price and availability.`),
      type: "product",
      image: absoluteAssetUrl(item.images?.[0] || item.products?.[0]?.product?.images?.[0]) || defaultImage,
      imageAlt: cleanText(item.name, defaultImageAlt),
      lastmod: item.updatedAt,
      data: {
        name: item.name,
        price: Number(item.price || 0),
        stock: Number(item.availableStock ?? item.stock ?? 0),
        stockKnown: item.availableStock != null || item.stock != null,
      },
    })),
    ...articles.filter((item) => item?.slug).map((item) => ({
      path: `/articles/${item.slug}`,
      title: `${cleanText(item.title)} | Ameyka Veda`,
      description: makeDescription(item, `Read ${item.title} from Ameyka Veda.`),
      type: "article",
      image: absoluteAssetUrl(item.coverImage) || defaultImage,
      imageAlt: cleanText(item.title, defaultImageAlt),
      lastmod: item.updatedAt || item.publishedAt,
      data: {
        headline: item.title,
        author: item.author || "Ameyka Veda",
        publishedAt: item.publishedAt,
        updatedAt: item.updatedAt,
      },
    })),
  ];
};

const staticPages = STATIC_INDEXABLE_ROUTES.map((route) => ({ ...route, type: route.path === "/" ? "home" : "page", image: defaultImage, imageAlt: defaultImageAlt }));

const loadPages = async ({ refresh }) => {
  if (!refresh) {
    try {
      return JSON.parse(await readFile(cacheFile, "utf8"));
    } catch {
      // A direct --dist invocation can rebuild the cache if necessary.
    }
  }

  let dynamic = [];
  try {
    dynamic = await dynamicPages();
  } catch (error) {
    try {
      const cached = JSON.parse(await readFile(cacheFile, "utf8"));
      dynamic = cached.filter((page) => !STATIC_INDEXABLE_ROUTES.some((route) => route.path === page.path));
      console.warn(`SEO catalogue refresh failed; using the previous cache (${error.message}).`);
    } catch {
      console.warn(`SEO catalogue refresh failed; generating static routes only (${error.message}).`);
    }
  }

  const deduplicated = new Map([...staticPages, ...dynamic].map((page) => [page.path, page]));
  const pages = [...deduplicated.values()].sort((first, second) => first.path.localeCompare(second.path));
  await mkdir(path.dirname(cacheFile), { recursive: true });
  await writeFile(cacheFile, `${JSON.stringify(pages, null, 2)}\n`);
  return pages;
};

const xmlEscape = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const htmlEscape = (value) => xmlEscape(value);
const validDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : "";
};

const writePublicSeo = async (pages) => {
  const sitemapRows = pages.map((page) => {
    const lastmod = validDate(page.lastmod);
    const image = page.image && page.image !== defaultImage
      ? `\n    <image:image><image:loc>${xmlEscape(page.image)}</image:loc></image:image>`
      : "";
    return `  <url>\n    <loc>${xmlEscape(absoluteSiteUrl(page.path))}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}${image}\n  </url>`;
  });
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${sitemapRows.join("\n")}\n</urlset>\n`;
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
  await mkdir(publicDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(publicDir, "sitemap.xml"), sitemap),
    writeFile(path.join(publicDir, "robots.txt"), robots),
  ]);
  console.log(`Generated sitemap.xml with ${pages.length} canonical URLs.`);
};

const jsonLdFor = (page) => {
  const canonical = absoluteSiteUrl(page.path);
  const breadcrumbItems = [{ name: "Home", item: `${siteUrl}/` }];
  if (page.type === "product") breadcrumbItems.push({ name: "Products", item: `${siteUrl}/products` });
  if (page.type === "category") breadcrumbItems.push({ name: "Categories", item: `${siteUrl}/categories` });
  if (page.type === "article") breadcrumbItems.push({ name: "Articles", item: `${siteUrl}/articles` });
  if (page.type === "product" && page.data?.categorySlug) {
    breadcrumbItems.push({ name: page.data.category || "Category", item: `${siteUrl}/categories/${page.data.categorySlug}` });
  }
  breadcrumbItems.push({ name: cleanText(page.data?.name || page.data?.headline || page.title), item: canonical });
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({ "@type": "ListItem", position: index + 1, ...item })),
  };

  if (page.type === "home") {
    return [{
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Ameyka Veda",
      legalName: "Ameyka Life Sciences",
      url: `${siteUrl}/`,
      logo: `${siteUrl}/logo.png`,
      email: "contact@ameykalifesciences.com",
      telephone: "+919882292197",
    }, {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Ameyka Veda",
      url: `${siteUrl}/`,
      inLanguage: "en-IN",
    }];
  }

  if (page.type === "product") {
    const product = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: page.data?.name,
      description: page.description,
      image: page.image,
      url: canonical,
      brand: { "@type": "Brand", name: page.data?.brand || "Ameyka Veda" },
      offers: {
        "@type": "Offer",
        url: canonical,
        priceCurrency: "INR",
        price: page.data?.price,
        availability: page.data?.stockKnown && page.data?.stock <= 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      },
    };
    if (page.data?.sku) product.sku = page.data.sku;
    if (page.data?.numReviews > 0 && page.data?.rating > 0) {
      product.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: page.data.rating,
        reviewCount: page.data.numReviews,
      };
    }
    return [product, breadcrumb];
  }

  if (page.path === "/faq") {
    return [{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      name: page.title,
      description: page.description,
      url: canonical,
      mainEntity: FAQ_ENTRIES.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    }];
  }

  if (page.type === "article") {
    return [{
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: page.data?.headline,
      description: page.description,
      image: page.image,
      url: canonical,
      datePublished: validDate(page.data?.publishedAt) || undefined,
      dateModified: validDate(page.data?.updatedAt) || undefined,
      author: { "@type": "Person", name: page.data?.author || "Ameyka Veda" },
      publisher: { "@id": `${siteUrl}/#organization` },
    }, breadcrumb];
  }

  return [{
    "@context": "https://schema.org",
    "@type": page.type === "category" ? "CollectionPage" : "WebPage",
    name: page.title,
    description: page.description,
    url: canonical,
    inLanguage: "en-IN",
  }];
};

const renderHead = (page, indexable = true) => {
  const canonical = absoluteSiteUrl(page.path);
  const image = page.image || defaultImage;
  const robots = indexable ? "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" : "noindex,follow";
  const type = page.type === "article" ? "article" : page.type === "product" ? "product" : "website";
  const schemas = indexable ? jsonLdFor(page) : [];
  const imageDimensions = image === defaultImage
    ? `    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n`
    : "";
  const scripts = schemas.map((schema) => `    <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`).join("\n");
  return `<!-- SEO:START -->
    <title>${htmlEscape(page.title)}</title>
    <meta name="description" content="${htmlEscape(page.description)}" />
    <meta name="robots" content="${robots}" />
    <meta name="googlebot" content="${robots}" />
    <link rel="canonical" href="${htmlEscape(canonical)}" />
    <link rel="alternate" hreflang="en-IN" href="${htmlEscape(canonical)}" />
    <link rel="alternate" hreflang="x-default" href="${htmlEscape(canonical)}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:title" content="${htmlEscape(page.title)}" />
    <meta property="og:description" content="${htmlEscape(page.description)}" />
    <meta property="og:site_name" content="Ameyka Veda" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:url" content="${htmlEscape(canonical)}" />
    <meta property="og:image" content="${htmlEscape(image)}" />
    <meta property="og:image:alt" content="${htmlEscape(page.imageAlt || defaultImageAlt)}" />
${imageDimensions}    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${htmlEscape(page.title)}" />
    <meta name="twitter:description" content="${htmlEscape(page.description)}" />
    <meta name="twitter:image" content="${htmlEscape(image)}" />
    <meta name="twitter:image:alt" content="${htmlEscape(page.imageAlt || defaultImageAlt)}" />
${scripts ? `${scripts}\n` : ""}    <!-- SEO:END -->`;
};

const renderStaticFallback = (page, indexable) => {
  if (!indexable) return '<div id="root"></div>';
  const heading = page.data?.name || page.data?.headline || page.title.replace(/\s*\|\s*Ameyka Veda.*$/i, "");
  return `<div id="root"><main style="min-height:60vh;padding:9rem 1.5rem 4rem;font-family:system-ui,-apple-system,sans-serif;color:#172018;background:#fff"><div style="max-width:72rem;margin:0 auto"><p style="margin:0 0 1rem;color:#8a5a20;font-size:.75rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase">Ameyka Veda</p><h1 style="max-width:52rem;margin:0;font-family:Georgia,serif;font-size:clamp(2rem,5vw,4rem);line-height:1.08">${htmlEscape(heading)}</h1><p style="max-width:46rem;margin:1.25rem 0 0;color:#526052;font-size:1rem;line-height:1.8">${htmlEscape(page.description)}</p><p style="margin-top:1.5rem"><a href="${htmlEscape(absoluteSiteUrl(page.path))}" style="color:#3f4725;font-weight:700">View this page</a></p></div></main></div>`;
};

const writeRouteHtml = async (template, page, indexable) => {
  const output = template
    .replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, renderHead(page, indexable))
    .replace('<div id="root"></div>', renderStaticFallback(page, indexable))
    .replace(/<noscript>[\s\S]*?<\/noscript>/, `<noscript>${htmlEscape(page.description)}</noscript>`);
  const target = page.path === "/" ? path.join(distDir, "index.html") : path.join(distDir, page.path.replace(/^\//, ""), "index.html");
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, output);
  if (page.path !== "/") {
    const cleanUrlTarget = path.join(distDir, `${page.path.replace(/^\//, "")}.html`);
    await mkdir(path.dirname(cleanUrlTarget), { recursive: true });
    await writeFile(cleanUrlTarget, output);
  }
};

const writeDistSeo = async (pages) => {
  const template = await readFile(path.join(distDir, "index.html"), "utf8");
  for (const page of pages) await writeRouteHtml(template, page, true);
  for (const pathname of STATIC_NOINDEX_ROUTES) {
    const route = getRouteSeo(pathname);
    await writeRouteHtml(template, { ...route, path: pathname, type: "private", image: defaultImage, imageAlt: defaultImageAlt }, false);
  }
  const notFound = { path: "/404", title: "Page Not Found | Ameyka Veda", description: "The requested page could not be found.", type: "not-found", image: defaultImage, imageAlt: defaultImageAlt };
  const notFoundHtml = template
    .replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, renderHead(notFound, false))
    .replace('<div id="root"></div>', renderStaticFallback(notFound, false));
  await writeFile(path.join(distDir, "404.html"), notFoundHtml);
  console.log(`Generated route-specific HTML metadata for ${pages.length} indexable routes and ${STATIC_NOINDEX_ROUTES.length} private routes.`);
};

const mode = process.argv[2] || "--public";
if (!["--public", "--dist"].includes(mode)) throw new Error("Use --public or --dist.");
if (mode === "--dist") {
  try {
    await stat(distDir);
  } catch {
    throw new Error("dist does not exist; run the Vite build first.");
  }
}
const pages = await loadPages({ refresh: mode === "--public" });
if (mode === "--public") await writePublicSeo(pages);
else await writeDistSeo(pages);
