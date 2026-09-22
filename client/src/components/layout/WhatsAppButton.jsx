import { SITE } from "../../config/site";
import { useLocation } from "react-router-dom";

export default function WhatsAppButton() {
  const { pathname } = useLocation();
  const number = SITE.supportPhoneHref.replace(/\D/g, "");
  const hasPurchaseBar = pathname.startsWith("/products/") || pathname.startsWith("/combos/");
  const bottomNavHidden = ["/checkout", "/login", "/register", "/forgot-password", "/reset-password"].some(
    (prefix) => pathname.startsWith(prefix),
  );
  const mobileBottom = hasPurchaseBar
    ? "bottom-[calc(10.25rem+env(safe-area-inset-bottom))]"
    : bottomNavHidden
      ? "bottom-[calc(1rem+env(safe-area-inset-bottom))]"
      : "bottom-[calc(5.75rem+env(safe-area-inset-bottom))]";

  return <a href={`https://wa.me/${number}`} target="_blank" rel="noopener noreferrer" aria-label={`Chat with Legend Born Nutrition on WhatsApp at ${SITE.supportPhoneDisplay}`} className={`fixed right-4 z-[65] block h-14 w-14 overflow-hidden rounded-full shadow-[0_8px_28px_rgba(0,0,0,0.4)] transition hover:scale-105 lg:bottom-6 lg:right-6 ${mobileBottom}`}>
    <img src="/whatsapp-icon.png" alt="" className="h-full w-full object-cover" />
  </a>;
}
