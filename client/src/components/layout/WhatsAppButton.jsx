import { SITE } from "../../config/site";

export default function WhatsAppButton() {
  const number = SITE.supportPhoneHref.replace(/\D/g, "");
  return <a href={`https://wa.me/${number}`} target="_blank" rel="noopener noreferrer" aria-label={`Chat with Legend Born Nutrition on WhatsApp at ${SITE.supportPhoneDisplay}`} className="fixed bottom-24 right-4 z-[65] block h-14 w-14 overflow-hidden rounded-full shadow-[0_8px_28px_rgba(0,0,0,0.4)] transition hover:scale-105 lg:bottom-6 lg:right-6">
    <img src="/whatsapp-icon.png" alt="" className="h-full w-full object-cover" />
  </a>;
}
