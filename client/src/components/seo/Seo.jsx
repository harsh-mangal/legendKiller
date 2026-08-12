import { useEffect } from "react";
import { SITE } from "../../config/site";

const ensureMeta = (attribute, key) => {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  return element;
};

const setMeta = (attribute, key, content) => {
  const element = ensureMeta(attribute, key);
  if (content === undefined || content === null || content === "") {
    element.remove();
    return;
  }
  element.setAttribute("content", String(content));
};

const ensureLink = (rel, hreflang) => {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    if (hreflang) element.setAttribute("hreflang", hreflang);
    document.head.appendChild(element);
  }
  return element;
};

export const absoluteUrl = (value = "/") => {
  try {
    return new URL(value, `${SITE.url}/`).toString();
  } catch {
    return `${SITE.url}/`;
  }
};

const replaceStructuredData = (namespace, structuredData) => {
  document.head
    .querySelectorAll(`script[data-seo-namespace="${namespace}"]`)
    .forEach((element) => element.remove());

  const items = (Array.isArray(structuredData) ? structuredData : [structuredData]).filter(Boolean);
  items.forEach((item, index) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seoNamespace = namespace;
    script.dataset.seoIndex = String(index);
    script.textContent = JSON.stringify(item).replace(/</g, "\\u003c");
    document.head.appendChild(script);
  });
};

export const clearStructuredData = (namespace) => {
  document.head
    .querySelectorAll(`script[data-seo-namespace="${namespace}"]`)
    .forEach((element) => element.remove());
};

export const applySeo = ({
  title,
  description,
  canonicalPath,
  image = SITE.ogImagePath,
  imageAlt = SITE.ogImageAlt,
  type = "website",
  indexable,
  structuredData,
  namespace = "content",
}) => {
  const canonical = absoluteUrl(canonicalPath || window.location.pathname);
  const imageUrl = image ? absoluteUrl(image) : "";

  if (title) document.title = title;
  setMeta("name", "description", description);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:type", type);
  setMeta("property", "og:url", canonical);
  setMeta("property", "og:site_name", SITE.name);
  setMeta("property", "og:locale", SITE.locale);
  setMeta("property", "og:image", imageUrl);
  setMeta("property", "og:image:alt", imageUrl ? imageAlt : "");
  setMeta("property", "og:image:width", "");
  setMeta("property", "og:image:height", "");
  setMeta("name", "twitter:card", imageUrl ? "summary_large_image" : "summary");
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", imageUrl);
  setMeta("name", "twitter:image:alt", imageUrl ? imageAlt : "");

  if (typeof indexable === "boolean") {
    const robots = indexable
      ? "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
      : "noindex,follow";
    setMeta("name", "robots", robots);
    setMeta("name", "googlebot", robots);
  }

  ensureLink("canonical").setAttribute("href", canonical);
  ensureLink("alternate", SITE.language).setAttribute("href", canonical);
  ensureLink("alternate", "x-default").setAttribute("href", canonical);

  if (structuredData !== undefined) replaceStructuredData(namespace, structuredData);
};

export const breadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export default function Seo(props) {
  const structuredDataJson = JSON.stringify(props.structuredData ?? null);

  useEffect(() => {
    applySeo(props);
  }, [
    props.title,
    props.description,
    props.canonicalPath,
    props.image,
    props.imageAlt,
    props.type,
    props.indexable,
    props.namespace,
    structuredDataJson,
  ]);

  return null;
}
