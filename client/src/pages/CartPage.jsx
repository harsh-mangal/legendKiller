import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import CartLineItem from "../components/cart/CartLineItem";
import CartSummary from "../components/cart/CartSummary";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { items } = useCart();

  return (
    <section className="page-section bg-[#0A0A0C]">
      <div className="container-page">
        <p className="section-eyebrow">Your Protocol</p>
        <h1 className="section-title mt-3">Shopping Shaker</h1>
        <p className="mt-4 max-w-2xl text-slate-300">Review supplement quantities and estimated totals before continuing to checkout.</p>

        {!items.length ? (
          <div className="mt-8 rounded-none border border-slate-800 bg-[#121216] px-6 py-14 text-center shadow-2xl">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-none bg-[#1A1A22] text-[#FF5500]">
              <ShoppingBag size={27} />
            </span>
            <h2 className="mt-5 text-2xl font-black uppercase text-white">Your Shaker Is Empty</h2>
            <p className="mt-2 text-sm text-slate-300">Add protein isolates, pre-workouts, or supplement stacks to continue.</p>
            <Link to="/products" className="btn-primary mt-7">EXPLORE SUPPLEMENTS</Link>
          </div>
        ) : (
          <div className="mt-7 grid gap-5 sm:mt-8 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
            <div className="space-y-3 sm:space-y-4">
              {items.map((item) => (
                <CartLineItem key={`${item.itemType}-${item.product._id}`} item={item} />
              ))}
            </div>
            <aside className="lg:sticky lg:top-28">
              <CartSummary />
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
