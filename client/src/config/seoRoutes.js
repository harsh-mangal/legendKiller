const BRAND = "Legend Killer";
const COMPANY = "Legend Born Nutrition";

export const DEFAULT_DESCRIPTION =
  "Shop high-performance Whey Protein Isolates, Pre-Workout, Creatine Monohydrate, and Mass Gainers from Legend Born Nutrition engineered for elite athletes.";

export const DEFAULT_KEYWORDS =
  "Legend Killer, Legend Born Nutrition, Whey Protein Isolate, Pre Workout Supplement, Creatine Monohydrate, Mass Gainer, Sports Nutrition India, NABL Certified Protein, Raw Imported Isolate, Authentic Fitness Supplements";

export const POLICY_TITLES = Object.freeze({
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
  shipping: "Shipping Policy",
  returns: "Returns & Refund Policy",
  cancellation: "Cancellation Policy",
  disclaimer: "Health & Product Disclaimer",
});

export const STATIC_INDEXABLE_ROUTES = Object.freeze([
  {
    path: "/",
    title: `${BRAND} | ${COMPANY} | The Viper Protocol`,
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
  },
  {
    path: "/products",
    title: `Protein & Sports Nutrition Supplements | ${BRAND} by ${COMPANY}`,
    description: `Explore the ${BRAND} performance range by ${COMPANY} with transparent macros, amino acid profiles, and lab test reports.`,
    keywords: "Buy Whey Protein Online, Pre Workout Powder India, Creatine Monohydrate Powder, Legend Killer Products, Sports Nutrition Shop, Muscle Building Supplements",
  },
  {
    path: "/categories",
    title: `Shop Fitness Supplements by Goal | ${BRAND} by ${COMPANY}`,
    description: `Browse ${BRAND} protein powders, pre-workouts, creatine, and mass gainers by fitness goal.`,
    keywords: "Supplement Categories, Muscle Gain Supplements, Fat Loss Protein, Endurance Pre Workout, Fitness Goal Supplements, Legend Born Categories",
  },
  {
    path: "/articles",
    title: `Bodybuilding & Supplement Guides | ${COMPANY}`,
    description: `Read scientific guides on whey protein timing, creatine loading, pre-workout nutrition, and muscle growth.`,
    keywords: "Fitness Blog, Whey Protein Guide, Creatine Loading Phase, Pre Workout Timing, Bodybuilding Nutrition Tips, Legend Born Articles",
  },
  {
    path: "/about",
    title: `About ${BRAND} | ${COMPANY} | The Viper Protocol`,
    description: `Learn how ${COMPANY} delivers 100% raw imported protein isolates with clinical dosages and NABL lab certification.`,
    keywords: "About Legend Born Nutrition, Legend Killer Brand, Pure Raw Isolate, NABL Accredited Lab Testing, Authentic Supplement Brand India",
  },
  {
    path: "/contact",
    title: `Contact ${COMPANY} | ${BRAND} Athlete Support`,
    description: `Contact ${COMPANY} for product guidance, order tracking, express delivery, and account support.`,
    keywords: "Contact Legend Born Nutrition, Legend Killer Support, Supplement Customer Care, Order Help, Legend Born Phone Number",
  },
  {
    path: "/faq",
    title: `Frequently Asked Questions | ${BRAND} by ${COMPANY}`,
    description: "Answers about supplement authenticity, scratch codes, protein dosage, pre-workout, shipping, and returns.",
    keywords: "Legend Killer Scratch Code, Authentic Protein Verification, Pre Workout Dosage FAQ, Legend Born Shipping FAQ, Supplement Authenticity",
  },
  ...Object.entries(POLICY_TITLES).map(([key, title]) => ({
    path: `/policies/${key}`,
    title: `${title} | ${COMPANY}`,
    description: `Review the ${title.toLowerCase()} for ${COMPANY} (${BRAND}).`,
    keywords: `${title}, ${COMPANY} Policy, ${BRAND} Terms, Legal Notice`,
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

export const getRouteSeo = (pathname = "/", search = "") => {
  const normalized = pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
  const exact = exactStatic.get(normalized);
  if (exact) {
    const hasFacets = normalized === "/products" && Boolean(String(search || "").replace(/^\?/, ""));
    return { ...exact, canonicalPath: normalized, indexable: !hasFacets, kind: normalized === "/" ? "home" : "page" };
  }

  if (/^\/verify(\/[^/]+)?$/.test(normalized)) {
    return {
      title: `Product Authenticity Verification | ${BRAND}`,
      description: `Verify 100% genuine and original ${BRAND} products with official security certificates and lab test reports.`,
      canonicalPath: normalized,
      indexable: true,
      kind: "page",
    };
  }

  if (/^\/products\/[^/]+$/.test(normalized)) {
    return {
      title: `Supplement Details | ${BRAND}`,
      description: "Review protein content, ingredients, amino acid profile, and lab test reports before ordering.",
      canonicalPath: normalized,
      indexable: true,
      kind: "product",
    };
  }

  if (/^\/combos\/[^/]+$/.test(normalized)) {
    return {
      title: `Supplement Stack | ${BRAND}`,
      description: `Review a ${BRAND} muscle building stack, included products, price and availability.`,
      canonicalPath: normalized,
      indexable: true,
      kind: "combo",
    };
  }

  if (/^\/categories\/[^/]+$/.test(normalized)) {
    return {
      title: `Supplement Category | ${BRAND}`,
      description: `Browse ${BRAND} products in this fitness category.`,
      canonicalPath: normalized,
      indexable: true,
      kind: "category",
    };
  }

  if (/^\/articles\/[^/]+$/.test(normalized)) {
    return {
      title: `Supplement Guide | ${BRAND}`,
      description: `Read scientific fitness and nutrition guidance from ${BRAND}.`,
      canonicalPath: normalized,
      indexable: true,
      kind: "article",
    };
  }

  const privateRoute = STATIC_NOINDEX_ROUTES.some(
    (route) => normalized === route || normalized.startsWith(`${route}/`),
  );

  return {
    title: privateRoute ? `Athlete Account | ${BRAND}` : `Page Not Found | ${BRAND}`,
    description: privateRoute
      ? `Secure customer shopping and account area for ${BRAND}.`
      : "The requested page could not be found.",
    canonicalPath: normalized,
    indexable: false,
    kind: privateRoute ? "private" : "not-found",
  };
};
