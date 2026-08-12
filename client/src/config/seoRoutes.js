const BRAND = "Legend Killer";

export const DEFAULT_DESCRIPTION =
  "Shop high-performance Whey Protein Isolates, Pre-Workout, Creatine Monohydrate, and Mass Gainers engineered for elite athletes and bodybuilders.";

export const POLICY_TITLES = Object.freeze({
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
  shipping: "Shipping Policy",
  returns: "Returns & Refund Policy",
  cancellation: "Cancellation Policy",
  disclaimer: "Health & Product Disclaimer",
});

export const STATIC_INDEXABLE_ROUTES = Object.freeze([
  { path: "/", title: `${BRAND} | The Viper Protocol | Protein & Sports Nutrition`, description: DEFAULT_DESCRIPTION },
  { path: "/products", title: `Protein & Sports Nutrition Supplements | ${BRAND}`, description: `Explore the ${BRAND} performance range with transparent macros, amino acid profiles, and lab test reports.` },
  { path: "/categories", title: `Shop Fitness Supplements by Goal | ${BRAND}`, description: `Browse ${BRAND} protein powders, pre-workouts, creatine, and mass gainers by fitness goal.` },
  { path: "/articles", title: `Bodybuilding & Supplement Guides | ${BRAND}`, description: `Read scientific guides on whey protein timing, creatine loading, pre-workout nutrition, and muscle growth.` },
  { path: "/about", title: `About ${BRAND} | The Viper Protocol`, description: `Learn how ${BRAND} delivers 100% raw imported protein isolates with clinical dosages and NABL lab certification.` },
  { path: "/contact", title: `Contact ${BRAND} | Athlete Support`, description: `Contact ${BRAND} for product guidance, order tracking, express delivery, and account support.` },
  { path: "/faq", title: `Frequently Asked Questions | ${BRAND}`, description: "Answers about supplement authenticity, scratch codes, protein dosage, pre-workout, shipping, and returns." },
  ...Object.entries(POLICY_TITLES).map(([key, title]) => ({
    path: `/policies/${key}`,
    title: `${title} | ${BRAND}`,
    description: `Review the ${title.toLowerCase()} for ${BRAND}.`,
  })),
]);

export const STATIC_NOINDEX_ROUTES = Object.freeze([
  "/cart",
  "/checkout",
  "/order-result",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/track-order",
  "/wishlist",
  "/addresses",
  "/profile",
  "/orders",
]);

const exactStatic = new Map(STATIC_INDEXABLE_ROUTES.map((route) => [route.path, route]));

export const getRouteSeo = (pathname, search = "") => {
  const exact = exactStatic.get(pathname);
  if (exact) {
    const hasFacets = pathname === "/products" && Boolean(String(search || "").replace(/^\?/, ""));
    return { ...exact, canonicalPath: pathname, indexable: !hasFacets, kind: pathname === "/" ? "home" : "page" };
  }

  if (/^\/products\/[^/]+$/.test(pathname)) {
    return {
      title: `Supplement Details | ${BRAND}`,
      description: "Review protein content, ingredients, amino acid profile, and lab test reports before ordering.",
      canonicalPath: pathname,
      indexable: true,
      kind: "product",
    };
  }

  if (/^\/combos\/[^/]+$/.test(pathname)) {
    return {
      title: `Supplement Stack | ${BRAND}`,
      description: `Review a ${BRAND} muscle building stack, included products, price and availability.`,
      canonicalPath: pathname,
      indexable: true,
      kind: "combo",
    };
  }

  if (/^\/categories\/[^/]+$/.test(pathname)) {
    return {
      title: `Supplement Category | ${BRAND}`,
      description: `Browse ${BRAND} products in this fitness category.`,
      canonicalPath: pathname,
      indexable: true,
      kind: "category",
    };
  }

  if (/^\/articles\/[^/]+$/.test(pathname)) {
    return {
      title: `Supplement Guide | ${BRAND}`,
      description: `Read scientific fitness and nutrition guidance from ${BRAND}.`,
      canonicalPath: pathname,
      indexable: true,
      kind: "article",
    };
  }

  const privateRoute = STATIC_NOINDEX_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  return {
    title: privateRoute ? `Athlete Account | ${BRAND}` : `Page Not Found | ${BRAND}`,
    description: privateRoute
      ? `Secure customer shopping and account area for ${BRAND}.`
      : "The requested page could not be found.",
    canonicalPath: pathname,
    indexable: false,
    kind: privateRoute ? "private" : "not-found",
  };
};
