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
      className="mobile-safe-bottom fixed inset-x-0 bottom-0 z-[70] border-t border-slate-200 bg-white/95 px-2 pt-1.5 shadow-[0_-8px_24px_rgba(41,45,38,0.10)] backdrop-blur-xl lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.slice(0, 3).map((item) => (
          <MobileLink key={item.label} item={item} pathname={location.pathname} />
        ))}

        <button
          type="button"
          onClick={openCart}
          className="relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-[6px] px-1 text-[10px] font-semibold text-slate-600 transition active:bg-slate-100"
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
      className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-[6px] px-1 text-[10px] font-semibold transition active:bg-slate-100 ${active ? "text-veda-leafDark" : "text-slate-600"}`}
      aria-current={active ? "page" : undefined}
    >
      <span className="relative">
        <Icon size={21} strokeWidth={active ? 2.4 : 2} />
        {item.count > 0 && <Count value={item.count} />}
      </span>
      <span>{item.label}</span>
      {active && <span className="absolute inset-x-4 top-0 h-0.5 bg-veda-copper" />}
    </Link>
  );
}

function Count({ value }) {
  return (
    <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-veda-copper px-1 text-[8px] font-bold leading-none text-white">
      {value > 99 ? "99+" : value}
    </span>
  );
}
