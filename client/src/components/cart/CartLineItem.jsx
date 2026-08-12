import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { money } from "../../utils/format";
import ProductImage from "../ui/ProductImage";

export default function CartLineItem({ item, onNavigate }) {
  const { updateQuantity, removeFromCart, itemKey } = useCart();
  const { product, quantity, itemType } = item;
  const key = itemKey(item);
  const isCombo = (itemType || product?.itemType) === "COMBO";
  const href = isCombo ? `/combos/${product?.slug}` : `/products/${product?.slug}`;
  const stock = Number(product?.availableStock || 0);
  const stockKnown = Boolean(product?.stockKnown);
  const unavailable = stockKnown && stock <= 0;

  const decrease = () => {
    if (quantity <= 1) removeFromCart(key);
    else updateQuantity(key, quantity - 1);
  };

  return (
    <article className="flex gap-3 rounded-[6px] border border-slate-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <Link to={href} onClick={onNavigate} className="shrink-0 overflow-hidden rounded-[4px]">
        <ProductImage
          src={product?.images?.[0]}
          alt={product?.name}
          className="h-20 w-20 object-cover sm:h-28 sm:w-28"
          fallbackClassName="h-20 w-20 sm:h-28 sm:w-28"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <Link
            to={href}
            onClick={onNavigate}
            className="line-clamp-2 text-[13px] font-semibold leading-5 text-slate-950 transition hover:text-amber-700 sm:text-base"
          >
            {product?.name}
          </Link>
          <p className="mt-1 text-xs text-slate-500">{isCombo ? "Combo pack" : product?.weight || "Product"}</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{money(product?.price)}</p>
          {unavailable && <p className="mt-1 text-xs font-semibold text-red-600">Currently unavailable</p>}
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2 sm:mt-3 sm:gap-3">
          <div className="inline-flex items-center rounded-[4px] border border-slate-300 bg-white">
            <button type="button" onClick={decrease} className="grid h-10 w-10 place-items-center transition hover:bg-slate-100" aria-label={`Decrease ${product?.name} quantity`}>
              <Minus size={14} />
            </button>
            <span className="min-w-9 text-center text-sm font-semibold" aria-live="polite">{quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(key, quantity + 1)}
              disabled={unavailable || (stockKnown && quantity >= stock)}
              className="grid h-10 w-10 place-items-center transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Increase ${product?.name} quantity`}
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeFromCart(key)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[4px] text-red-600 transition hover:bg-red-50"
            aria-label={`Remove ${product?.name} from cart`}
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
