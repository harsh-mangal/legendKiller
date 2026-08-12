import { Heart, ShoppingBag, Star, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { catalogItemPath, isComboCatalogItem } from "../../utils/catalog";
import { discountPercent, money } from "../../utils/format";
import ProductImage from "../ui/ProductImage";
import QuickViewModal from "./QuickViewModal";

export default function ProductCard({ product }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addToCart, openCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const saved = isWishlisted(product);
  const isCombo = isComboCatalogItem(product);
  const href = catalogItemPath(product);
  const rating = Number(product.rating || 0);
  const hasDiscount = Number(product.mrp || 0) > Number(product.price || 0);
  const discount = hasDiscount ? discountPercent(product.mrp, product.price) : 0;
  const outOfStock = Boolean(product.stockKnown && Number(product.availableStock) <= 0);

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (outOfStock) return;
    addToCart(product, 1);
    openCart();
  };

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#121216] transition duration-300 before:absolute before:inset-x-0 before:top-0 before:z-20 before:h-[3px] before:origin-left before:scale-x-0 before:bg-gradient-to-r before:from-[#FFB800] before:via-[#FF5500] before:to-[#FF1F00] before:transition-transform hover:border-[#FF5500]/60 hover:shadow-2xl hover:shadow-[#FF5500]/10 hover:before:scale-x-100">
      <div className="relative aspect-square overflow-hidden border-b border-slate-800 bg-[#0A0A0C] sm:aspect-[4/3]">
        <Link to={href} className="block h-full w-full" aria-label={`View ${product.name}`}>
          <ProductImage src={product.images?.[0]} alt={product.name} className="h-full w-full object-contain p-2.5 transition duration-500 group-hover:scale-[1.06] sm:p-3" fallbackClassName="h-full w-full" />
        </Link>
        <button
          type="button"
          onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleWishlist(product); }}
          className={`absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-lg border bg-[#121216]/90 shadow-md backdrop-blur transition sm:right-3 sm:top-3 ${saved ? "border-[#FF1F00] text-[#FF1F00]" : "border-slate-800 text-slate-400 hover:border-[#FF5500] hover:text-[#FFB800]"}`}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={17} className={saved ? "fill-current" : ""} />
        </button>
        {hasDiscount && (
          <span className="absolute left-0 top-3 rounded-r bg-gradient-to-r from-[#FF1F00] to-[#FF5500] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-md sm:top-4 sm:px-3 sm:text-[10px]">
            SAVE {discount}%
          </span>
        )}
        {!hasDiscount && isCombo && (
          <span className="absolute left-0 top-3 rounded-r bg-gradient-to-r from-[#FFB800] to-[#FF5500] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-black shadow-md sm:top-4 sm:px-3 sm:text-[10px]">
            COMBO PACK
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-x-2 bottom-2 rounded border border-slate-800 bg-[#0A0A0C]/90 px-2 py-1.5 text-center text-[10px] font-bold text-red-500 backdrop-blur sm:inset-x-3 sm:bottom-3 sm:text-xs">
            OUT OF STOCK
          </span>
        )}
        {!outOfStock && (
          <button
            type="button"
            onClick={(event) => { event.preventDefault(); event.stopPropagation(); setQuickViewOpen(true); }}
            className="absolute inset-x-3 bottom-3 hidden min-h-10 translate-y-3 items-center justify-center rounded border border-[#FF5500]/40 bg-[#0A0A0C]/90 px-3 text-[10px] font-extrabold uppercase tracking-widest text-white opacity-0 backdrop-blur transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 sm:flex hover:border-[#FF5500] hover:bg-[#FF5500] hover:text-black"
          >
            QUICK VIEW
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <p className="truncate text-[9px] font-black uppercase tracking-[0.18em] text-[#FFB800] sm:text-[10px]">
            {product.category?.name || (isCombo ? "Combo Pack" : "Legend Killer")}
          </p>
          <Zap size={12} className="shrink-0 text-[#FF5500]" />
        </div>

        <Link to={href} className="mt-2 line-clamp-2 min-h-10 font-display text-[15px] font-bold leading-[1.25] text-white transition hover:text-[#FFB800] sm:mt-2.5 sm:min-h-11 sm:text-base">
          {product.name}
        </Link>

        <p className="mt-1 line-clamp-1 text-[11px] text-slate-400 sm:text-xs">
          {isCombo ? (product.products?.length ? `${product.products.length} Products Included` : product.weight || "Value Combo") : product.weight || "Standard Weight"}
        </p>

        <div className="mt-3 flex flex-wrap items-baseline gap-1.5 border-t border-slate-800 pt-3 sm:mt-4 sm:gap-2 sm:pt-4">
          <span className="text-lg font-black text-white sm:text-xl">{money(product.price)}</span>
          {hasDiscount && <span className="text-[11px] text-slate-500 line-through sm:text-xs">{money(product.mrp)}</span>}
          <div className="ml-auto flex items-center gap-1 text-xs text-[#FFB800]">
            <Star size={13} className={rating > 0 ? "fill-current text-[#FFB800]" : "text-slate-600"} />
            <span className="font-bold">{rating ? rating.toFixed(1) : "NEW"}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded border-0 bg-gradient-to-r from-[#FFB800] via-[#FF5500] to-[#FF1F00] px-3 py-2.5 text-xs font-black uppercase tracking-wider text-black transition duration-200 hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-600 sm:mt-4"
        >
          <ShoppingBag size={15} />
          {outOfStock ? "UNAVAILABLE" : "ADD TO SHAKER"}
        </button>
        <button
          type="button"
          onClick={() => setQuickViewOpen(true)}
          className="mt-2 min-h-8 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-[#FFB800] sm:hidden"
        >
          Quick View
        </button>
      </div>
      <QuickViewModal product={product} open={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
    </article>
  );
}
