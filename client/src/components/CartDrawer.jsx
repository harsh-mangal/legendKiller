import { ShoppingBag, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useModalDialog } from "../hooks/useModalDialog";
import CartLineItem from "./cart/CartLineItem";
import CartSummary from "./cart/CartSummary";

export default function CartDrawer() {
  const { items, isCartOpen, closeCart } = useCart();
  const { dialogRef, initialFocusRef } = useModalDialog(isCartOpen, closeCart);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]" role="presentation">
      <button
        type="button"
        onClick={closeCart}
        aria-label="Close cart"
        className="absolute inset-0 bg-slate-950/[0.45]"
      />

      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 sm:px-5 sm:py-4">
          <div>
            <p className="section-eyebrow">Cart</p>
            <h2 id="cart-drawer-title" className="mt-1 text-xl font-semibold text-slate-950 sm:text-2xl">Shopping cart</h2>
          </div>
          <button ref={initialFocusRef} type="button" onClick={closeCart} className="icon-button" aria-label="Close cart">
            <X size={19} />
          </button>
        </header>

        {!items.length ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-700">
              <ShoppingBag size={27} />
            </span>
            <h3 className="mt-5 text-2xl font-semibold text-slate-950">Your shopping bag is empty</h3>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">Browse the collection and add products to begin your order.</p>
            <Link to="/products" onClick={closeCart} className="btn-primary mt-7">
              Shop products
            </Link>
          </div>
        ) : (
          <>
            <div className="touch-scroll flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:px-5 sm:py-4">
              {items.map((item) => (
                <CartLineItem key={`${item.itemType}-${item.product._id}`} item={item} onNavigate={closeCart} />
              ))}
            </div>
            <div className="mobile-safe-bottom border-t border-slate-200 bg-slate-50 p-4 sm:p-5">
              <CartSummary compact onCheckout={closeCart} />
              <div className="mt-3 flex items-center justify-center gap-4 text-sm font-semibold">
                <Link to="/cart" onClick={closeCart} className="text-slate-600 hover:text-slate-950">View full cart</Link>
                <span className="h-4 w-px bg-slate-300" aria-hidden="true" />
                <Link to="/products?bestSeller=true" onClick={closeCart} className="text-veda-leaf hover:text-veda-copper">Add another product</Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
