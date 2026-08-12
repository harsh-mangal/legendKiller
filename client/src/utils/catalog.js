export const getCatalogType = (item = {}) => {
  const explicit = String(item.catalogType || "").toLowerCase();
  if (explicit === "combo" || explicit === "product") return explicit;
  if (String(item.itemType || "").toUpperCase() === "COMBO") return "combo";

  const categorySlug = String(item.category?.slug || item.categorySlug || "").toLowerCase();
  if (categorySlug === "value-combos" || categorySlug === "combos") return "combo";
  return "product";
};

export const isComboCatalogItem = (item) => getCatalogType(item) === "combo";

export const catalogItemPath = (item = {}) =>
  String(item.itemType || "").toUpperCase() === "COMBO"
    ? `/combos/${item.slug}`
    : `/products/${item.slug}`;
