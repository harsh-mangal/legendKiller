import { Heart, Home, ShoppingBag, Store, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const hiddenPrefixes = [
  "/checkout",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const { cartCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();

  if (hiddenPrefixes.some((prefix) => location.pathname.startsWith(prefix))) return null;

  const accountPath = isLoggedIn ? "/profile" : "/login";
  const items = [
    { label: "Home", path: "/", icon: Home, exact: true },
    { label: "Shop", path: "/products", icon: Store },
    { label: "Wishlist", path: "/wishlist", icon: Heart, count: wishlistCount },
    { label: "Account", path: accountPath, icon: User },
  ];

  return (
    <nav
      className="mobile-safe-bottom fixed inset-x-0 bottom-0 z-[70] border-t border-slate-800/80 bg-[#0A0A0C]/95 px-2 pt-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.slice(0, 3).map((item) => (
          <MobileLink key={item.label} item={item} pathname={location.pathname} />
        ))}

        <button
          type="button"
          onClick={openCart}
          className="relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition active:bg-[#121216]"
          aria-label={`Open cart with ${cartCount} items`}
        >
          <span className="relative">
            <ShoppingBag size={21} />
            <Count value={cartCount} />
          </span>
          <span>Cart</span>
        </button>

        <MobileLink item={items[3]} pathname={location.pathname} />
      </div>
    </nav>
  );
}

function MobileLink({ item, pathname }) {
  const Icon = item.icon;
  const active = item.exact ? pathname === item.path : pathname === item.path || pathname.startsWith(`${item.path}/`);

  return (
    <Link
      to={item.path}
      className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-bold uppercase tracking-wider transition active:bg-[#121216] ${active ? "text-[#FFB800]" : "text-slate-400 hover:text-white"}`}
      aria-current={active ? "page" : undefined}
    >
      <span className="relative">
        <Icon size={21} strokeWidth={active ? 2.5 : 2} />
        {item.count > 0 && <Count value={item.count} />}
      </span>
      <span>{item.label}</span>
      {active && <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-gradient-to-r from-[#FFB800] to-[#FF5500]" />}
    </Link>
  );
}

function Count({ value }) {
  return (
    <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF5500] px-1 text-[8px] font-black leading-none text-black">
      {value > 99 ? "99+" : value}
    </span>
  );
}
