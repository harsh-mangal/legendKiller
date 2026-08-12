import { ArrowRight, CheckCircle2, ShoppingBag, Star, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useModalDialog } from "../../hooks/useModalDialog";
import { catalogItemPath, isComboCatalogItem } from "../../utils/catalog";
import { discountPercent, money } from "../../utils/format";
import ProductImage from "../ui/ProductImage";

export default function QuickViewModal({ product, open, onClose }) {
  const { addToCart, openCart } = useCart();
  const { dialogRef, initialFocusRef } = useModalDialog(open, onClose);
  if (!open) return null;

  const href = catalogItemPath(product);
  const outOfStock = Boolean(product.stockKnown && Number(product.availableStock) <= 0);
  const hasDiscount = Number(product.mrp) > Number(product.price);
  const isCombo = isComboCatalogItem(product);
  const benefits = Array.isArray(product.benefits) ? product.benefits.slice(0, 3) : [];

  const add = () => {
    if (outOfStock) return;
    addToCart(product, 1);
    onClose();
    openCart();
  };

  return (
    <div className="fixed inset-0 z-[120] grid place-items-end bg-black/80 backdrop-blur-sm sm:place-items-center sm:p-5" role="presentation">
      <button type="button" onClick={onClose} className="absolute inset-0" aria-label="Close quick view" />
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`quick-view-${product._id}`} className="mobile-safe-bottom relative z-10 max-h-[94vh] w-full overflow-y-auto bg-[#121216] border border-slate-800 shadow-2xl rounded-none sm:max-w-4xl">
        <button ref={initialFocusRef} type="button" onClick={onClose} className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center bg-[#1A1A22] text-white border border-slate-700 hover:border-[#FF5500]" aria-label="Close quick view"><X size={18} /></button>
        <div className="grid md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative grid min-h-72 place-items-center bg-[#0A0A0C] p-6 sm:min-h-96">
            {hasDiscount && <span className="absolute left-0 top-5 bg-gradient-to-r from-[#FF1F00] to-[#FF5500] px-4 py-2 text-xs font-black uppercase text-white shadow-md">Save {discountPercent(product.mrp, product.price)}%</span>}
            <ProductImage src={product.images?.[0]} alt={product.name} className="h-72 w-full object-contain sm:h-96" fallbackClassName="h-72 w-full sm:h-96" />
          </div>
          <div className="p-5 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFB800]">{product.category?.name || (isCombo ? "Combo Pack" : "Legend Killer")}</p>
            <h2 id={`quick-view-${product._id}`} className="mt-3 text-2xl font-black uppercase leading-tight text-white sm:text-3xl">{product.name}</h2>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
              <Star size={14} className={Number(product.rating) > 0 ? "fill-[#FFB800] text-[#FFB800]" : "text-slate-600"} />
              <span className="font-bold">{Number(product.rating) > 0 ? `${Number(product.rating).toFixed(1)} Rating` : "New Protocol"}</span>
              <span>•</span>
              <span className={outOfStock ? "text-red-500 font-bold" : "text-emerald-400 font-bold"}>{outOfStock ? "Out of Stock" : "In Stock"}</span>
            </div>
            <p className="mt-5 line-clamp-3 text-sm leading-7 text-slate-300">{product.shortDescription || product.description || (isCombo ? "Curated high-performance supplement stack." : "View complete supplement specifications and macros.")}</p>

            {benefits.length > 0 && (
              <ul className="mt-5 space-y-2">
                {benefits.map((benefit) => <li key={benefit} className="flex gap-2 text-sm font-semibold text-slate-200"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#FF5500]" /> <span>{benefit}</span></li>)}
              </ul>
            )}

            <div className="mt-6 flex flex-wrap items-baseline gap-3 border-y border-slate-800 py-5">
              <span className="text-3xl font-black text-white">{money(product.price)}</span>
              {hasDiscount && <span className="text-sm text-slate-500 line-through">{money(product.mrp)}</span>}
              {product.weight && <span className="ml-auto text-xs font-bold text-[#FFB800]">{product.weight}</span>}
            </div>

            <button type="button" onClick={add} disabled={outOfStock} className="btn-primary mt-6 w-full"><ShoppingBag size={18} /> {outOfStock ? "Currently Unavailable" : "Add to Shaker"}</button>
            <Link to={href} onClick={onClose} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 text-sm font-black uppercase text-[#FFB800] transition hover:text-[#FF5500]">View Full Protocol Details <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
