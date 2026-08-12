import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { productApi } from "../../services/api";
import { isComboCatalogItem } from "../../utils/catalog";
import ProductCard from "../product/ProductCard";

export default function ProductShelf({
  eyebrow,
  title,
  description = "",
  params = {},
  viewAllUrl = "/products",
  tone = "white",
  limit = 8,
  singleProductsOnly = true,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestLimit = singleProductsOnly ? Math.max(limit * 2, 12) : limit;
  const paramsKey = JSON.stringify({ ...params, limit: requestLimit, singleProductsOnly });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");

    productApi
      .getProducts({ ...params, limit: requestLimit }, { signal: controller.signal })
      .then((items) => {
        if (active) {
          const visibleItems = singleProductsOnly
            ? items.filter((item) => !isComboCatalogItem(item))
            : items;
          setProducts(visibleItems.slice(0, limit));
        }
      })
      .catch((requestError) => {
        if (active && requestError?.name !== "AbortError") {
          setError("Products are temporarily unavailable.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [paramsKey, limit, requestLimit, singleProductsOnly]);

  if (!loading && !error && !products.length) return null;

  return (
    <section className={`py-10 sm:py-16 ${tone === "soft" ? "border-y border-slate-200 bg-slate-50" : "bg-white"}`}>
      <div className="container-page">
        <div className="mb-6 flex items-end justify-between gap-4 border-b border-slate-200 pb-4 sm:mb-8 sm:pb-5">
          <div className="min-w-0">
            <p className="section-eyebrow">{eyebrow}</p>
            <h2 className="mt-2 font-display text-[1.8rem] font-semibold leading-tight text-slate-950 sm:text-4xl">{title}</h2>
            {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
          </div>
          <Link to={viewAllUrl} className="hidden shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-veda-leaf transition hover:text-veda-copper sm:inline-flex">
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: limit }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse border border-slate-200 bg-white sm:h-80" />
            ))}
          </div>
        ) : error ? (
          <div className="border border-slate-200 bg-white p-5 text-center text-sm text-slate-600">{error}</div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
            {products.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        )}

        <Link to={viewAllUrl} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-veda-leaf px-4 text-xs font-bold uppercase tracking-[0.12em] text-veda-leaf sm:hidden">
          View all products <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
