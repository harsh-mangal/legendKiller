import { Heart, Menu, Search, ShoppingBag, User, X, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SITE } from "../../config/site";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import Sidebar from "./Sidebar";

import { ARCHITECTURES } from "../../data/architecturesData";

const navLinks = [
  { label: "SHOP ALL", path: "/products" },
  { label: "BESTSELLERS", path: "/products?bestSeller=true" },
  { label: "CATEGORIES", path: "/categories" },
  { label: "ARTICLES", path: "/articles" },
  { label: "ARCHITECTURES", path: "/architectures", hasDropdown: true },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef(null);
  const { cartCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setSidebarOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (searchOpen) window.setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  const submitSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    navigate(`/products?search=${encodeURIComponent(value)}`);
    setQuery("");
    setSearchOpen(false);
  };

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${scrolled ? "shadow-[0_10px_30px_rgba(0,0,0,0.8)] border-b border-[#FF5500]/30" : ""}`}>
        {/* Top Ticker Bar */}
        <div className="bg-gradient-to-r from-[#FFB800] via-[#FF5500] to-[#FF1F00] text-black overflow-hidden">
          <div className="container-page flex h-7 items-center justify-between text-[10px] font-black uppercase tracking-wider sm:h-8 sm:text-[11px]">
            {/* Mobile Ticker - Smooth Continuous Scrolling Marquee */}
            <div className="flex overflow-hidden w-full sm:hidden">
              <div className="marquee-track flex whitespace-nowrap gap-8 items-center shrink-0">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="animate-bounce" />
                  <span>THE VIPER PROTOCOL | UP TO 40% OFF ON PROTEIN & PRE-WORKOUT</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={14} className="animate-bounce" />
                  <span>FREE EXPRESS SHIPPING ON ORDERS ABOVE ₹999</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={14} className="animate-bounce" />
                  <span>THE VIPER PROTOCOL | UP TO 40% OFF ON PROTEIN & PRE-WORKOUT</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={14} className="animate-bounce" />
                  <span>FREE EXPRESS SHIPPING ON ORDERS ABOVE ₹999</span>
                </div>
              </div>
            </div>

            {/* Tablet & Desktop Ticker */}
            <div className="hidden sm:flex items-center gap-2 truncate">
              <Zap size={14} className="animate-bounce" />
              <span>THE VIPER PROTOCOL | UP TO 40% OFF ON PROTEIN & PRE-WORKOUT</span>
            </div>
            <div className="hidden items-center gap-5 sm:flex">
              <Link to="/architectures" className="transition hover:underline">Architectures</Link>
              <Link to="/track-order" className="transition hover:underline">Track Order</Link>
              <a href={`tel:${SITE.supportPhoneHref}`} className="transition hover:underline">Support: {SITE.supportPhoneDisplay}</a>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="relative border-b border-slate-900/80 bg-[#0A0A0C]/95 backdrop-blur-xl">
          <div className="container-page relative flex h-[72px] items-center justify-between gap-2 sm:h-[88px] lg:h-[104px]">
            <div className="w-[88px] flex shrink-0 items-center justify-start xl:w-auto xl:flex-none">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="icon-button xl:hidden"
                aria-label="Open navigation menu"
              >
                <Menu size={22} className="text-white" />
              </button>
            </div>

            <div className="flex flex-1 items-center justify-center overflow-hidden px-1 xl:overflow-visible">
              <Link to="/" className="flex w-full max-w-[220px] shrink-0 items-center justify-center sm:w-auto sm:max-w-full" aria-label="Legend Killer Home">
                <img
                  src="/logo.png"
                  alt="Legend Killer"
                  className="block h-auto w-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.12)] transition-all duration-300 sm:h-[72px] sm:w-auto md:h-20 lg:h-24"
                />
              </Link>
            </div>

            <nav className="hidden items-center gap-8 xl:flex" aria-label="Primary navigation">
              {navLinks.map((link) => {
                const [path, search = ""] = link.path.split("?");
                const currentSearch = new URLSearchParams(location.search);
                const targetSearch = new URLSearchParams(search);
                const hasTargetSearch = [...targetSearch.keys()].length > 0;
                const searchMatches = [...targetSearch.entries()].every(([key, value]) => currentSearch.get(key) === value);
                const isProductsRoot = path === "/products" && !hasTargetSearch;
                const isActive = path === "/categories"
                  ? location.pathname.startsWith("/categories")
                  : path === "/architectures"
                  ? location.pathname.startsWith("/architectures")
                  : location.pathname === path && (hasTargetSearch ? searchMatches : isProductsRoot ? !currentSearch.get("bestSeller") && !currentSearch.get("type") : true);

                if (link.hasDropdown) {
                  return (
                    <div key={link.path} className="relative group py-2">
                      <Link
                        to={link.path}
                        className={`relative py-2 text-xs font-black uppercase tracking-widest transition after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:bg-gradient-to-r after:from-[#FFB800] after:to-[#FF5500] after:transition-transform ${isActive ? "text-[#FFB800] after:scale-x-100" : "text-slate-300 after:scale-x-0 group-hover:text-[#FFB800] group-hover:after:scale-x-100"}`}
                      >
                        {link.label}
                      </Link>

                      {/* Dropdown Menu */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 hidden group-hover:block w-80 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="border border-slate-800 bg-[#0A0A0C] p-3 shadow-2xl backdrop-blur-2xl">
                          <p className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#FF5500] border-b border-slate-800 pb-2 mb-2">
                            6 Viper Protocol™ Architectures
                          </p>
                          <div className="space-y-1">
                            {ARCHITECTURES.map((arch) => (
                              <Link
                                key={arch.id}
                                to={`/architectures/${arch.slug}`}
                                className="block p-2.5 hover:bg-[#1A1A22] transition border-l-2 border-transparent hover:border-[#FF5500]"
                              >
                                <p className="text-xs font-black uppercase text-white hover:text-[#FFB800]">
                                  {arch.title}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 truncate">
                                  {arch.subtitle}
                                </p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative py-2 text-xs font-black uppercase tracking-widest transition after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:bg-gradient-to-r after:from-[#FFB800] after:to-[#FF5500] after:transition-transform ${isActive ? "text-[#FFB800] after:scale-x-100" : "text-slate-300 after:scale-x-0 hover:text-[#FFB800] hover:after:scale-x-100"}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="w-[88px] flex shrink-0 items-center justify-end gap-1 sm:gap-2 xl:w-auto">
              <button
                type="button"
                onClick={() => setSearchOpen((value) => !value)}
                className="icon-button"
                aria-label={searchOpen ? "Close search" : "Open search"}
                aria-expanded={searchOpen}
              >
                {searchOpen ? <X size={20} className="text-white" /> : <Search size={20} className="text-white" />}
              </button>
              <Link
                to="/wishlist"
                className="icon-button relative hidden sm:inline-flex"
                aria-label={`Wishlist with ${wishlistCount} items`}
              >
                <Heart size={20} className="text-white" />
                {wishlistCount > 0 && <Count value={wishlistCount} />}
              </Link>
              <Link
                to={isLoggedIn ? "/profile" : "/login"}
                className="icon-button hidden sm:inline-flex"
                aria-label={isLoggedIn ? "My account" : "Log in"}
              >
                <User size={20} className="text-white" />
              </Link>
              <button
                type="button"
                onClick={openCart}
                className="icon-button relative"
                aria-label={`Open cart with ${cartCount} items`}
              >
                <ShoppingBag size={21} className="text-white" />
                <Count value={cartCount} />
              </button>
            </div>
          </div>

          {searchOpen && (
            <form onSubmit={submitSearch} className="absolute inset-x-0 top-full border-y border-slate-800 bg-[#121216] py-3.5 shadow-2xl">
              <div className="container-page flex gap-2 sm:gap-3">
                <input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="SEARCH PROTEIN, PRE-WORKOUT, CREATINE..." className="min-w-0 flex-1 rounded border border-slate-800 bg-[#0A0A0C] px-4 py-3 text-sm font-bold text-white placeholder:text-slate-500 focus:border-[#FF5500] uppercase" aria-label="Search supplements" />
                <button type="submit" className="btn-primary shrink-0 px-6 py-3 font-black">SEARCH</button>
              </div>
            </form>
          )}
        </div>
      </header>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} links={navLinks} />
    </>
  );
}

function Count({ value }) {
  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#FFB800] to-[#FF5500] px-1 text-[9px] font-black text-black shadow-md">
      {value > 99 ? "99+" : value}
    </span>
  );
}
