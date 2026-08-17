import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE } from "../../config/site";
import { getRouteSeo } from "../../config/seoRoutes";
import { FAQ_ENTRIES } from "../../content/faq";
import { absoluteUrl, applySeo, clearStructuredData } from "../seo/Seo";

const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  legalName: SITE.legalEntity,
  url: `${SITE.url}/`,
  logo: absoluteUrl("/logo.png"),
  email: SITE.supportEmail,
  telephone: SITE.supportPhoneHref,
  address: {
    "@type": "PostalAddress",
    ...(SITE.address || {}),
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    telephone: SITE.supportPhoneHref,
    email: SITE.supportEmail,
    availableLanguage: ["English", "Hindi"],
    areaServed: "IN",
  },
});

const routeStructuredData = (route) => {
  const url = absoluteUrl(route.canonicalPath);

  if (route.kind === "home") {
    return [
      organizationSchema(),
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        name: SITE.name,
        url: `${SITE.url}/`,
        inLanguage: SITE.language,
        publisher: { "@id": `${SITE.url}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE.url}/products?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ];
  }

  if (route.canonicalPath === "/faq") {
    return [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        name: route.title,
        url,
        mainEntity: FAQ_ENTRIES.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ];
  }

  if (["product", "combo", "category", "article"].includes(route.kind)) {
    return [];
  }

  return [
    {
      "@context": "https://schema.org",
      "@type": route.canonicalPath === "/contact" ? "ContactPage" : "WebPage",
      name: route.title,
      description: route.description,
      url,
      inLanguage: SITE.language,
      isPartOf: { "@id": `${SITE.url}/#website` },
    },
  ];
};

export default function RouteMeta() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const route = getRouteSeo(pathname, search);
    clearStructuredData("content");
    applySeo({
      ...route,
      type: route.kind === "article" ? "article" : "website",
      structuredData: routeStructuredData(route),
      namespace: "route",
    });
  }, [pathname, search]);

  return null;
}
