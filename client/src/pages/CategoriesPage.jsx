import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CategoryBanner from "../components/category/CategoryBanner";
import Seo, { absoluteUrl } from "../components/seo/Seo";
import ProductImage from "../components/ui/ProductImage";
import Alert from "../components/ui/Alert";
import { EmptyState } from "../components/ui/PageState";
import { bannerApi, categoryApi } from "../services/api";
import { SITE } from "../config/site";

const featuredCategorySlugs = ["pre-workout-energy", "coconut-water"];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    Promise.all([
      categoryApi.getCategories({ signal: controller.signal }),
      bannerApi.getBanners("categories", { signal: controller.signal }).catch(() => []),
    ])
      .then(([categoryItems, bannerItems]) => {
        if (!active) return;
        setCategories(categoryItems);
        setBanners(bannerItems);
      })
      .catch((requestError) => {
        if (active && requestError?.name !== "AbortError") setError("Categories could not be loaded. Please try again.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, []);

  const featuredCategories = featuredCategorySlugs
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter(Boolean);

  return (
    <section className="pb-10 sm:pb-16 bg-[#0A0A0C]">
      {!loading && (
        <Seo
          title={`Shop Sports Nutrition Categories | ${SITE.name}`}
          description={`Browse ${SITE.name} Pre-Workout and Coconut Water performance categories.`}
          canonicalPath="/categories"
          indexable
          structuredData={[{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Supplement Categories | ${SITE.name}`,
            url: absoluteUrl("/categories"),
            mainEntity: {
              "@type": "ItemList",
              itemListElement: featuredCategories.map((category, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: category.name,
                url: absoluteUrl(`/categories/${category.slug}`),
              })),
            },
          }]}
        />
      )}
      <CategoryBanner banners={banners} />

      <div className="container-page pt-8 sm:pt-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-eyebrow">Target Your Protocol</p>
            <h1 className="section-title mt-3">Performance Categories</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">Choose Pre-Workout for energy and focus, or Coconut Water for hydration and recovery.</p>
          </div>
          <Link to="/products" className="btn-outline w-full shrink-0 sm:w-auto">Explore All Products</Link>
        </div>

        {loading ? (
          <div className="mt-7 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-40 animate-pulse bg-[#121216] sm:h-48 border border-slate-800" />)}</div>
        ) : error ? (
          <Alert type="error" className="mt-8">{error}</Alert>
        ) : !featuredCategories.length ? (
          <div className="mt-8"><EmptyState title="No categories available" description="Please check back later or browse all products." action={<Link to="/products" className="btn-primary">Explore Products</Link>} /></div>
        ) : (
          <div className="mt-7 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {featuredCategories.map((category) => (
              <Link key={category._id} to={`/categories/${category.slug}`} className="group flex min-h-40 flex-col items-center justify-center border border-slate-800 bg-[#121216] p-3.5 text-center shadow-2xl transition hover:border-[#FF5500] sm:min-h-48 rounded-none sm:p-5 sm:hover:-translate-y-1">
                <ProductImage src={category.image} alt={category.name} className="h-16 w-16 object-contain sm:h-24 sm:w-24" fallbackClassName="h-16 w-16 sm:h-24 sm:w-24" />
                <h2 className="mt-3 text-sm font-black uppercase leading-5 text-white group-hover:text-[#FFB800] sm:mt-5 sm:text-base">{category.name}</h2>
                {category.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{category.description}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
