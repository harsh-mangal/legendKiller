import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { comboApi, productApi } from "../../services/api";
import ProductCard from "../product/ProductCard";

export default function ComboShelf() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    Promise.allSettled([
      comboApi.getCombos({}, { signal: controller.signal }),
      productApi.getProducts({ category: "value-combos", featured: "true" }, { signal: controller.signal }),
    ])
      .then((results) => {
        if (!active) return;
        const items = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
        const unique = [...new Map(items.map((item) => [`${item.itemType}-${item._id}`, item])).values()];
        setCombos(unique.slice(0, 4));
      })
      .catch(() => {
        if (active) setCombos([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  if (!loading && !combos.length) return null;

  return (
    <section className="border-y border-slate-200 bg-veda-leafDark py-10 text-white sm:py-16">
      <div className="container-page">
        <div className="mb-6 flex items-end justify-between gap-4 border-b border-white/20 pb-4 sm:mb-8 sm:pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-veda-gold">Value packs</p>
            <h2 className="mt-2 font-display text-[1.8rem] font-semibold leading-tight text-white sm:text-4xl">Shop more together.</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">Browse available combo packs and compare the included products before adding them to your cart.</p>
          </div>
          <Link to="/products?type=combos" className="hidden shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-veda-gold transition hover:text-white sm:inline-flex">
            All combos <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-72 animate-pulse border border-white/15 bg-white/10 sm:h-80" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
            {combos.map((combo) => <ProductCard key={combo._id} product={combo} />)}
          </div>
        )}
      </div>
    </section>
  );
}
