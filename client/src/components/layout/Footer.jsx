import { Headphones, PackageCheck, RotateCcw, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE } from "../../config/site";

const columns = [
  {
    title: "Protocols",
    links: [
      ["All Supplements", "/products"],
      ["Legend Born Architectures", "/architectures"],
      ["Patents", "/patents"],
      ["Article of Legend Slayer: The Viper Protocol", "/articles"],
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
      ["24/7 Support", "/contact"],
      ["Become a Dealer", "/dealer"],
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
  [ShieldCheck, "Scan. Verify. Authenticate."],
  [PackageCheck, "World’s Most Advanced Patented Ingredients"],
  [RotateCcw, "Transparency is the Standard"],
  [Headphones, "24/7 Support"],
];

const authenticationSteps = [
  {
    step: "01",
    title: "Find the QR Code",
    description:
      "Every genuine Legend Killer jar comes with a unique authentication QR code.",
  },
  {
    step: "02",
    title: "Scan the QR",
    description:
      "Open your phone camera and scan the QR code printed on the jar.",
  },
  {
    step: "03",
    title: "Verify Authenticity",
    description:
      "You’ll be redirected to our official authentication page where you can instantly verify your product.",
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-[#0A0A0C] text-slate-100">
      {/* Assurance Strip */}
      <div className="border-b border-slate-800 bg-[#121216]">
        <div className="container-page grid grid-cols-2 divide-x divide-y divide-slate-800 sm:grid-cols-4 sm:divide-y-0">
          {assurances.map(([Icon, title]) => (
            <div
              key={title}
              className="flex min-h-16 items-center justify-center gap-2.5 px-3 py-3 sm:min-h-20 sm:justify-start sm:px-5"
            >
              <Icon size={18} className="shrink-0 text-[#FF5500]" />

              <span className="text-[10px] font-black uppercase tracking-wider text-slate-200 sm:text-[11px]">
                {title}
              </span>
            </div>
          ))}
        </div>
      </div>
      <section className="border-y border-slate-800 bg-[#0D0D10] py-12 sm:py-16">
        <div className="container-page">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-[#FF5500]">
              Product Authentication
            </span>

            <h2 className="mt-3 text-2xl font-black uppercase text-white sm:text-4xl">
              Know What You’re Putting
              <span className="block text-[#FFB800]">Inside Your Body.</span>
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">
              Every Legend Killer product can be authenticated in seconds. Scan.
              Verify. Trust.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {authenticationSteps.map((item) => (
              <div
                key={item.step}
                className="group relative overflow-hidden border border-slate-800 bg-[#121216] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#FF5500]"
              >
                <div className="absolute right-4 top-2 text-6xl font-black text-white/[0.03]">
                  {item.step}
                </div>

                <div className="mb-5 flex h-11 w-11 items-center justify-center border border-[#FF5500]/40 bg-[#FF5500]/10 text-sm font-black text-[#FF5500]">
                  {item.step}
                </div>

                <h3 className="text-lg font-black uppercase text-white">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

        
        </div>
      </section>
      {/* Main Footer */}
      <div className="bg-[#0A0A0C] text-white">
        <div className="container-page grid gap-10 py-10 sm:py-16 lg:grid-cols-[0.9fr_1.3fr] lg:gap-16">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="inline-block p-0 transition hover:opacity-90"
              aria-label="Legend Killer home"
            >
              <img
                src="/logo.png"
                alt="Legend Killer"
                className="block h-20 w-auto max-w-[340px] object-contain sm:h-28 sm:max-w-[440px] md:h-32 lg:h-36 lg:max-w-[520px]"
              />
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              Legend Killer — The Viper Protocol.
              <br /> Where world-class ingredients, globally patented
              innovations, and architectural design converge into one unified
              human performance system.
            </p>

            {/* Support Details */}
            <div className="mt-5 text-sm leading-7 text-slate-300">
              <a
                href={`tel:${SITE.supportPhoneHref}`}
                className="block font-bold transition hover:text-[#FFB800]"
              >
                Support: {SITE.supportPhoneDisplay}
              </a>

              <a
                href={`mailto:${SITE.supportEmail}`}
                className="block break-all transition hover:text-[#FFB800]"
              >
                {SITE.supportEmail}
              </a>

              <a
                href="mailto:[REDACTED EMAIL ADDRESS]"
                className="block break-all transition hover:text-[#FFB800]"
              >
                [REDACTED EMAIL ADDRESS]
              </a>
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
            {columns.map((column, index) => (
              <div
                key={column.title}
                className={index === 2 ? "col-span-2 sm:col-span-1" : ""}
              >
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFB800]">
                  {column.title}
                </h3>

                <ul
                  className={`mt-4 ${
                    index === 2
                      ? "grid grid-cols-2 gap-x-4 gap-y-2.5 sm:block sm:space-y-2.5"
                      : "space-y-2.5"
                  }`}
                >
                  {column.links.map(([label, path]) => (
                    <li key={label}>
                      <Link
                        to={path}
                        className="inline-flex min-h-8 items-center text-[13px] font-semibold text-slate-400 transition hover:text-[#FF5500] sm:text-sm"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 bg-[#070709]">
          <div className="container-page flex flex-col gap-2 py-5 text-[10px] leading-5 text-slate-500 sm:text-[11px] md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} {SITE.name} ({SITE.legalEntity}). All
              rights reserved.
            </p>

            <p>
              100% Raw Materials Sourced &amp; Manufactured in FSSAI &amp; GMP
              Certified Facilities.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
