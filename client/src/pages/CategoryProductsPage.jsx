import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CategoryBanner from "../components/category/CategoryBanner";
import Seo, { absoluteUrl, breadcrumbSchema } from "../components/seo/Seo";
import ProductCard from "../components/product/ProductCard";
import Alert from "../components/ui/Alert";
import { EmptyState } from "../components/ui/PageState";
import { bannerApi, categoryApi, productApi } from "../services/api";
import { SITE } from "../config/site";
import { catalogItemPath } from "../utils/catalog";

export default function CategoryProductsPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [productError, setProductError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setCategory(null);
    setProducts([]);
    setBanners([]);
    setCategoryError("");
    setProductError("");

    bannerApi
      .getBanners("categories", { signal: controller.signal, categorySlug: slug })
      .then((items) => {
        if (active) setBanners(items);
      })
      .catch(() => {
        if (active) setBanners([]);
      });

    Promise.allSettled([
      categoryApi.getCategories({ signal: controller.signal }),
      productApi.getProducts({ category: slug }, { signal: controller.signal }),
    ]).then(([categoryResult, productResult]) => {
      if (!active) return;
      if (categoryResult.status === "fulfilled") {
        setCategory(categoryResult.value.find((item) => item.slug === slug) || null);
      } else {
        setCategoryError("This category could not be loaded. Please try again.");
      }
      if (productResult.status === "fulfilled") setProducts(productResult.value);
      else {
        setProducts([]);
        setProductError("Products in this category could not be loaded.");
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
    <section className="bg-[#0A0A0C] pb-10 sm:pb-16">
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
      {!loading && category && <CategoryBanner banners={banners} />}
      <div className="container-page pt-8 sm:pt-14">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-white">Home</Link><span aria-hidden="true">/</span>
          <Link to="/categories" className="hover:text-white">Categories</Link><span aria-hidden="true">/</span>
          <span className="truncate text-slate-200" aria-current="page">{category?.name || "Category"}</span>
        </nav>

        {loading ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-80 animate-pulse bg-[#121216]" />)}
          </div>
        ) : categoryError ? (
          <Alert type="error">{categoryError}</Alert>
        ) : !category ? (
          <EmptyState
            title="Category not found"
            description="The requested category does not exist or is no longer available."
            action={<Link to="/categories" className="btn-primary">Browse categories</Link>}
          />
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-eyebrow">Performance category</p>
                <h1 className="section-title mt-3">{category.name}</h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                  {category.description || "Explore products in this category and review their ingredients, directions and suitability before choosing."}
                </p>
              </div>
              <Link to="/products" className="btn-outline shrink-0">Full product range</Link>
            </div>

            {productError ? (
              <Alert type="error" className="mt-8">{productError}</Alert>
            ) : !products.length ? (
              <div className="mt-8"><EmptyState title="No products available" description="There are currently no products listed in this category." action={<Link to="/products" className="btn-primary">Explore full range</Link>} /></div>
            ) : (
              <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
