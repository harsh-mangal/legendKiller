import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 420);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname.startsWith("/checkout")) return null;

  const hasPurchaseBar = pathname.startsWith("/products/") || pathname.startsWith("/combos/");
  const mobileBottom = hasPurchaseBar
    ? "bottom-[calc(10.25rem+env(safe-area-inset-bottom))]"
    : "bottom-[calc(5.75rem+env(safe-area-inset-bottom))]";

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      title="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed right-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-soft transition duration-200 hover:border-slate-300 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 sm:bottom-7 sm:right-7 sm:h-11 sm:w-11 ${mobileBottom} ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
    >
      <ArrowUp size={18} strokeWidth={2.2} />
    </button>
  );
}
