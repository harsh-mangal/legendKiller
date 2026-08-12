import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Seo, { absoluteUrl, breadcrumbSchema } from "../components/seo/Seo";
import ProductCard from "../components/product/ProductCard";
import Alert from "../components/ui/Alert";
import { EmptyState } from "../components/ui/PageState";
import { categoryApi, productApi } from "../services/api";
import { SITE } from "../config/site";
import { catalogItemPath } from "../utils/catalog";

export default function CategoryProductsPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");

    Promise.allSettled([
      categoryApi.getCategories({ signal: controller.signal }),
      productApi.getProducts({ category: slug }, { signal: controller.signal }),
    ]).then(([categoryResult, productResult]) => {
      if (!active) return;
      const categoryItems = categoryResult.status === "fulfilled" ? categoryResult.value : [];
      setCategory(categoryItems.find((item) => item.slug === slug) || null);
      if (productResult.status === "fulfilled") setProducts(productResult.value);
      else {
        setProducts([]);
        setError("Products in this category could not be loaded.");
      }
      setLoading(false);
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [slug]);

  const canonicalPath = `/categories/${slug}`;
  const seoDescription = String(category?.description || `Browse ${SITE.name} products in this wellness category.`).replace(/\s+/g, " ").trim().slice(0, 180);
  const collectionSchema = category ? {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} Products`,
    description: seoDescription,
    url: absoluteUrl(canonicalPath),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
        url: absoluteUrl(catalogItemPath(product)),
      })),
    },
  } : null;

  return (
    <section className="page-section">
      {!loading && (
        <Seo
          title={category ? `${category.name} Products | ${SITE.name}` : `Category Not Found | ${SITE.name}`}
          description={category ? seoDescription : "The requested product category could not be found."}
          canonicalPath={canonicalPath}
          image={category?.image || SITE.ogImagePath}
          imageAlt={category?.name || SITE.ogImageAlt}
          indexable={Boolean(category)}
          structuredData={category ? [collectionSchema, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Categories", path: "/categories" }, { name: category.name, path: canonicalPath }])] : []}
        />
      )}
      <div className="container-page">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-950">Home</Link><span aria-hidden="true">/</span>
          <Link to="/categories" className="hover:text-slate-950">Categories</Link><span aria-hidden="true">/</span>
          <span className="truncate text-slate-700" aria-current="page">{category?.name || "Category"}</span>
        </nav>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-eyebrow">Wellness category</p>
            <h1 className="section-title mt-3">{category?.name || "Products"}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{category?.description || "Explore products in this wellness category and review their ingredients, directions and suitability before choosing."}</p>
          </div>
          <Link to="/products" className="btn-outline shrink-0">Full wellness range</Link>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-80 animate-pulse rounded-[8px] bg-slate-100" />)}</div>
        ) : error ? (
          <Alert type="error" className="mt-8">{error}</Alert>
        ) : !products.length ? (
          <div className="mt-8"><EmptyState title="No products available" description="There are currently no products listed in this category." action={<Link to="/products" className="btn-primary">Explore full range</Link>} /></div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div>
        )}
      </div>
    </section>
  );
}
