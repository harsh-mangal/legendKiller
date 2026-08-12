import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Seo, { absoluteUrl, breadcrumbSchema } from "../components/seo/Seo";
import Alert from "../components/ui/Alert";
import ProductImage from "../components/ui/ProductImage";
import { COMMERCE } from "../config/commerce";
import { SITE } from "../config/site";
import { useCart } from "../context/CartContext";
import { comboApi, getErrorMessage, imageUrl } from "../services/api";
import { discountPercent, money } from "../utils/format";

export default function ComboViewPage() {
  const { slug } = useParams();
  const { addToCart, openCart } = useCart();
  const [combo, setCombo] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");
    setCombo(null);
    setQuantity(1);
    comboApi
      .getComboBySlug(slug, { signal: controller.signal })
      .then((item) => {
        if (!item?._id) throw new Error("Combo not found.");
        if (active) setCombo(item);
      })
      .catch((requestError) => {
        if (active && requestError?.name !== "AbortError") setError(getErrorMessage(requestError, "This combo could not be loaded."));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [slug]);

  if (loading) return <div className="container-page py-16"><div className="h-[520px] animate-pulse rounded-[8px] bg-slate-100" /></div>;
  if (error || !combo) return <section className="page-section pb-28 lg:pb-24"><Seo title={`Combo Not Found | ${SITE.name}`} description="The requested combo pack is not currently available." canonicalPath={`/combos/${slug}`} indexable={false} structuredData={[]} /><div className="container-page max-w-2xl"><Alert type="error">{error || "Combo not found."}</Alert><Link to="/products?type=combos" className="btn-outline mt-6">Browse combos</Link></div></section>;

  const outOfStock = Boolean(combo.stockKnown && Number(combo.availableStock) <= 0);
  const maxQuantity = Number(combo.availableStock || 0) > 0 ? Number(combo.availableStock) : undefined;
  const hasDiscount = Number(combo.mrp) > Number(combo.price);
  const changeQuantity = (next) => {
    const safe = Math.min(COMMERCE.maxItemQuantity, Math.max(1, Math.floor(Number(next || 1))));
    setQuantity(maxQuantity ? Math.min(maxQuantity, safe) : safe);
  };

  const addCombo = () => {
    if (outOfStock) return;
    addToCart(combo, quantity);
    openCart();
  };

  const canonicalPath = `/combos/${combo.slug}`;
  const seoDescription = String(combo.seoDescription || combo.shortDescription || combo.description || `View ${combo.name}, included products, price and availability.`).replace(/\s+/g, " ").trim().slice(0, 180);
  const comboSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: combo.name,
    description: seoDescription,
    image: combo.images || [],
    url: absoluteUrl(canonicalPath),
    brand: { "@type": "Brand", name: SITE.name },
    category: "Wellness combo",
    isRelatedTo: (combo.products || []).map((item) => item.product).filter(Boolean).map((product) => ({
      "@type": "Product",
      name: product.name,
      url: absoluteUrl(`/products/${product.slug}`),
    })),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(canonicalPath),
      priceCurrency: SITE.currency,
      price: Number(combo.price || 0),
      availability: outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE.url}/#organization` },
    },
  };

  return (
    <section className="page-section">
      <Seo
        title={combo.seoTitle || `${combo.name} Combo Pack | ${SITE.name}`}
        description={seoDescription}
        canonicalPath={canonicalPath}
        image={combo.images?.[0] || SITE.ogImagePath}
        imageAlt={combo.name}
        type="product"
        indexable
        structuredData={[
          comboSchema,
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Products", path: "/products" }, { name: combo.name, path: canonicalPath }]),
        ]}
      />
      <div className="container-page grid gap-8 sm:gap-10 lg:grid-cols-2 lg:items-start">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 overflow-hidden text-xs text-slate-500 lg:col-span-2">
          <Link to="/" className="shrink-0 hover:text-slate-950">Home</Link><span aria-hidden="true">/</span>
          <Link to="/products" className="shrink-0 hover:text-slate-950">Products</Link><span aria-hidden="true">/</span>
          <span className="truncate text-slate-700" aria-current="page">{combo.name}</span>
        </nav>
        <div className="overflow-hidden border border-slate-200 bg-slate-100 shadow-sm sm:rounded-[8px]">
          <ProductImage src={combo.images?.[0]} alt={combo.name} className="aspect-square h-auto w-full object-contain sm:h-[560px] sm:aspect-auto" fallbackClassName="aspect-square h-auto w-full sm:h-[560px] sm:aspect-auto" loading="eager" />
        </div>

        <div>
          <p className="section-eyebrow">Combo pack</p>
          <h1 className="section-title mt-3">{combo.name}</h1>
          <p className="mt-5 text-[15px] leading-7 text-slate-600 sm:text-base sm:leading-8">{combo.description || combo.shortDescription || "A curated performance stack of Legend Killer supplements."}</p>

          <div className="mt-7 flex flex-wrap items-end gap-3 border-y border-slate-200 py-6">
            <span className="text-3xl font-semibold text-slate-950 sm:text-4xl">{money(combo.price)}</span>
            {hasDiscount && <><span className="pb-1 text-lg text-slate-500 line-through">{money(combo.mrp)}</span><span className="mb-1 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">{discountPercent(combo.mrp, combo.price)}% off</span></>}
          </div>

          <p className={`mt-4 text-sm font-semibold ${outOfStock ? "text-red-600" : "text-emerald-700"}`}>{outOfStock ? "Currently unavailable" : maxQuantity ? `${maxQuantity} combo packs available` : "Available"}</p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <div className="inline-flex h-12 items-center rounded-[4px] border border-slate-300">
              <button type="button" onClick={() => changeQuantity(quantity - 1)} disabled={outOfStock || quantity <= 1} className="grid h-12 w-12 place-items-center rounded-l-lg hover:bg-slate-100" aria-label="Decrease quantity"><Minus size={16} /></button>
              <span className="min-w-12 text-center font-semibold">{quantity}</span>
              <button type="button" onClick={() => changeQuantity(quantity + 1)} disabled={outOfStock || quantity >= (maxQuantity || COMMERCE.maxItemQuantity)} className="grid h-12 w-12 place-items-center rounded-r-lg hover:bg-slate-100 disabled:opacity-40" aria-label="Increase quantity"><Plus size={16} /></button>
            </div>
            <button type="button" onClick={addCombo} disabled={outOfStock} className="btn-primary h-12 w-full px-6 sm:w-auto sm:px-8"><ShoppingBag size={18} /> {outOfStock ? "Unavailable" : "Add combo to cart"}</button>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-semibold text-slate-950">Included products</h2>
            <div className="mt-5 space-y-3">
              {(combo.products || []).map((item, index) => {
                const product = item.product;
                if (!product) return null;
                return (
                  <Link to={`/products/${product.slug}`} key={product._id || index} className="group flex items-center gap-4 rounded-[6px] border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
                    <ProductImage src={imageUrl(product.images?.[0])} alt={product.name} className="h-20 w-20 rounded-[4px] object-cover" fallbackClassName="h-20 w-20 rounded-[4px]" />
                    <div className="min-w-0 flex-1"><p className="font-semibold text-slate-950 group-hover:text-amber-700">{product.name}</p><p className="mt-1 text-sm text-slate-500">Quantity in combo: {item.quantity || 1}</p></div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="mobile-safe-bottom fixed inset-x-0 bottom-[calc(4.45rem+env(safe-area-inset-bottom))] z-40 border-t border-slate-200 bg-white/95 px-4 pt-3 shadow-[0_-8px_24px_rgba(41,45,38,0.12)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1"><p className="truncate text-[11px] text-slate-500">{combo.name}</p><p className="text-lg font-bold text-slate-950">{money(combo.price)}</p></div>
          <button type="button" onClick={addCombo} disabled={outOfStock} className="btn-primary min-w-[150px] px-5"><ShoppingBag size={17} /> {outOfStock ? "Unavailable" : "Add combo"}</button>
        </div>
      </div>
    </section>
  );
}
