import { Headphones, PackageCheck, RotateCcw, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE } from "../../config/site";

const columns = [
  {
    title: "Protocols",
    links: [
      ["All Supplements", "/products"],
      ["Bestseller Whey", "/products?bestSeller=true"],
      ["Categories", "/categories"],
      ["Combo Stacks", "/products?type=combos"],
      ["Fitness Articles", "/articles"],
      ["My Wishlist", "/wishlist"],
    ],
  },
  {
    title: "Orders",
    links: [
      ["Track Order", "/track-order"],
      ["My Orders", "/orders"],
      ["My Account", "/profile"],
      ["Saved Addresses", "/addresses"],
      ["Athlete Support", "/contact"],
    ],
  },
  {
    title: "Policies",
    links: [
      ["Express Shipping", "/policies/shipping"],
      ["Returns & Refunds", "/policies/returns"],
      ["Cancellation", "/policies/cancellation"],
      ["Privacy Policy", "/policies/privacy"],
      ["Terms of Use", "/policies/terms"],
      ["Health Disclaimer", "/policies/disclaimer"],
    ],
  },
];

const assurances = [
  [ShieldCheck, "100% Genuine Scratch Code"],
  [PackageCheck, "NABL Accredited Lab Tested"],
  [RotateCcw, "7-Day Easy Returns"],
  [Headphones, "24/7 Athlete Support"],
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-[#0A0A0C] text-slate-100">
      <div className="border-b border-slate-800 bg-[#121216]">
        <div className="container-page grid grid-cols-2 divide-x divide-y divide-slate-800 sm:grid-cols-4 sm:divide-y-0">
          {assurances.map(([Icon, title]) => (
            <div key={title} className="flex min-h-16 items-center justify-center gap-2.5 px-3 py-3 sm:min-h-20 sm:justify-start sm:px-5">
              <Icon size={18} className="shrink-0 text-[#FF5500]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-200 sm:text-[11px]">{title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#0A0A0C] text-white">
        <div className="container-page grid gap-10 py-10 sm:py-16 lg:grid-cols-[0.9fr_1.3fr] lg:gap-16">
          <div>
            <Link to="/" className="inline-block p-0 transition hover:opacity-90" aria-label="Legend Killer home">
              <img src="/logo.png" alt="Legend Killer" className="h-20 sm:h-28 md:h-32 lg:h-36 w-auto max-w-[340px] sm:max-w-[440px] lg:max-w-[520px] object-contain block" />
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              Legend Killer — The Viper Protocol. High-performance sports nutrition engineered for elite bodybuilders, athletes, and fitness legends.
            </p>
            <div className="mt-5 text-sm leading-7 text-slate-300">
              <a href={`tel:${SITE.supportPhoneHref}`} className="block font-bold transition hover:text-[#FFB800]">Support: {SITE.supportPhoneDisplay}</a>
              <a href={`mailto:${SITE.supportEmail}`} className="block break-all transition hover:text-[#FFB800]">{SITE.supportEmail}</a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
            {columns.map((column, index) => (
              <div key={column.title} className={index === 2 ? "col-span-2 sm:col-span-1" : ""}>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFB800]">{column.title}</h3>
                <ul className={`mt-4 ${index === 2 ? "grid grid-cols-2 gap-x-4 gap-y-2.5 sm:block sm:space-y-2.5" : "space-y-2.5"}`}>
                  {column.links.map(([label, path]) => (
                    <li key={label}>
                      <Link to={path} className="inline-flex min-h-8 items-center text-[13px] font-semibold text-slate-400 transition hover:text-[#FF5500] sm:text-sm">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 bg-[#070709]">
          <div className="container-page flex flex-col gap-2 py-5 text-[10px] leading-5 text-slate-500 sm:text-[11px] md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} {SITE.name} ({SITE.legalEntity}). All rights reserved.</p>
            <p>100% Raw Materials Sourced &amp; Manufactured in FSSAI &amp; GMP Certified Facilities.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
