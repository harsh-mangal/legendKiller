import { useEffect, useState } from "react";
import {
  ArrowRight,
  Zap,
  Droplets,
  Dumbbell,
  ShieldCheck,
  Check,
  Search,
  ClipboardCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { bannerApi } from "../../services/api";

const featuredGoals = [
  {
    icon: Zap,
    label: "Energy + focus",
    title: "Pre-Workout",
    description: "Explosive energy, sharp focus, and a powerful pump for high-intensity training.",
    to: "/categories/pre-workout-energy",
  },
  {
    icon: Droplets,
    label: "Hydration + recovery",
    title: "Coconut Water",
    description: "Electrolyte-rich hydration support for endurance, recovery, and sustained performance.",
    to: "/categories/coconut-water",
  },
];

const journey = [
  {
    icon: Search,
    step: "01",
    title: "Select Your Protocol",
    description: "Choose your target fitness goal — Muscle Gain, Strength, Energy, or Fat Loss.",
  },
  {
    icon: ClipboardCheck,
    step: "02",
    title: "Review Lab Transparency",
    description: "Check complete nutritional macros, amino acid profile, and batch test reports.",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "100% Authentic Express Delivery",
    description: "Order with guaranteed authenticity codes and fast doorstep delivery across India.",
  },
];

export default function ConversionSections() {
  return (
    <>
      <FitnessGoals />
      <ShoppingJourney />
      <ClarityComparison />
      <ReadyToShop />
    </>
  );
}

function FitnessGoals() {
  const [protocolBanner, setProtocolBanner] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    bannerApi
      .getBanners("home_protocol", { signal: controller.signal })
      .then((items) => {
        if (active && Array.isArray(items) && items.length > 0) {
          setProtocolBanner(items[0]);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const isDesktopVideo =
    protocolBanner &&
    (protocolBanner.mediaType === "video" ||
      /\.(mp4|webm|mov|ogg|mkv)($|\?)/i.test(protocolBanner.image || ""));
  const isMobileVideo =
    protocolBanner &&
    (protocolBanner.mobileMediaType === "video" ||
      /\.(mp4|webm|mov|ogg|mkv)($|\?)/i.test(protocolBanner.mobileImage || ""));

  return (
    <section className="border-y border-slate-800 bg-[#0A0A0C] py-12 text-white sm:py-20">
      <div className="container-page">
        <div className={`grid gap-10 lg:items-center ${protocolBanner ? "lg:grid-cols-[0.9fr_1.1fr] lg:gap-16" : "max-w-3xl"}`}>
          <div className="lg:py-8">
            <p className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-[#FFB800]">
              <span className="h-0.5 w-8 bg-gradient-to-r from-[#FFB800] to-[#FF5500]" /> Fuel Your Greatness
            </p>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
              Choose Your Performance Fuel.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
              Two focused formulas for the moments that matter most: powerful training energy and complete workout hydration.
            </p>

            <nav className="mt-8 border-y border-slate-800" aria-label="Featured performance categories">
              {featuredGoals.map(({ icon: Icon, label, title, description, to }) => (
                <Link
                  key={title}
                  to={to}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-slate-800 py-6 transition-colors last:border-b-0 hover:text-[#FFB800] sm:gap-5 sm:py-7"
                >
                  <span className="grid h-12 w-12 place-items-center border border-[#FF5500]/40 bg-[#FF5500]/10 text-[#FFB800] sm:h-14 sm:w-14">
                    <Icon size={23} strokeWidth={2.2} />
                  </span>
                  <span>
                    <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#FF5500]">{label}</span>
                    <span className="mt-1 block font-display text-xl font-black uppercase text-white sm:text-2xl">{title}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-400">{description}</span>
                  </span>
                  <ArrowRight className="text-[#FFB800] transition-transform group-hover:translate-x-1" size={21} />
                </Link>
              ))}
            </nav>
          </div>

          {protocolBanner && (
            <div className="relative aspect-square w-full max-w-[640px] overflow-hidden border border-slate-800 bg-[#121216] shadow-card lg:justify-self-end">
              {protocolBanner.link ? (
                <Link to={protocolBanner.link} className="group block h-full w-full">
                  {renderProtocolMedia(protocolBanner, isDesktopVideo, isMobileVideo)}
                </Link>
              ) : (
                renderProtocolMedia(protocolBanner, isDesktopVideo, isMobileVideo)
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function renderProtocolMedia(banner, isDesktopVideo, isMobileVideo) {
  return (
    <div className="relative h-full w-full">
      <div className="block sm:hidden w-full h-full">
        {isMobileVideo ? (
          <video
            autoPlay
            loop
            muted
            defaultMuted
            playsInline
            webkit-playsinline="true"
            disablePictureInPicture
            disableRemotePlayback
            controls={false}
            className="w-full h-full object-cover pointer-events-none select-none"
          >
            <source src={banner.mobileImage || banner.image} />
          </video>
        ) : (
          <img
            src={banner.mobileImage || banner.image}
            alt={banner.title || "Training Protocol Banner"}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="hidden sm:block w-full h-full">
        {isDesktopVideo ? (
          <video
            autoPlay
            loop
            muted
            defaultMuted
            playsInline
            webkit-playsinline="true"
            disablePictureInPicture
            disableRemotePlayback
            controls={false}
            className="w-full h-full object-cover pointer-events-none select-none"
          >
            <source src={banner.image} />
          </video>
        ) : (
          <img
            src={banner.image}
            alt={banner.title || "Training Protocol Banner"}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
}

function ShoppingJourney() {
  return (
    <section className="heritage-pattern py-12 sm:py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-eyebrow justify-center before:hidden">The Viper Protocol</p>
          <h2 className="mt-3 font-display text-3xl font-black uppercase text-white sm:text-5xl">3 Steps to Legend Performance</h2>
          <p className="mt-4 text-sm text-slate-400 sm:text-base">Uncompromising quality and transparency from raw material sourcing to your shaker.</p>
        </div>

        <div className="relative mt-10 grid gap-4 md:grid-cols-3 md:gap-0">
          <div className="absolute left-[16.67%] right-[16.67%] top-9 hidden h-0.5 bg-gradient-to-r from-[#FFB800] via-[#FF5500] to-[#FF1F00] md:block" aria-hidden="true" />
          {journey.map(({ icon: Icon, step, title, description }) => (
            <article key={step} className="relative z-10 rounded-xl border border-slate-800 bg-[#121216] p-6 text-center shadow-card md:mx-3 md:p-8">
              <span className="mx-auto grid h-[72px] w-[72px] place-items-center rounded-full border border-[#FF5500] bg-[#0A0A0C] text-[#FFB800]">
                <Icon size={28} strokeWidth={2} />
              </span>
              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#FF5500]">Step {step}</p>
              <h3 className="mt-2 text-xl font-bold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClarityComparison() {
  const checks = [
    ["Protein Purity", "100% Raw Imported Whey Isolate with zero spiking"],
    ["Nutritional Transparency", "Exact macro breakdown, BCAA count, and digestive enzymes"],
    ["Authenticity Guarantee", "Unique scratch-and-verify security code on every tub"],
    ["Lab Testing", "NABL accredited lab certified for zero banned substances"],
    ["VIP Loyalty", "Earn Viper Coins on every purchase redeemable for instant discounts"],
  ];

  return (
    <section className="border-y border-slate-800 bg-[#0A0A0C] py-12 sm:py-20">
      <div className="container-page grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
        <div>
          <p className="section-eyebrow">The Legend Standard</p>
          <h2 className="mt-3 font-display text-3xl font-black uppercase leading-tight text-white sm:text-5xl">Zero Fillers. Pure Performance.</h2>
          <p className="mt-5 text-sm leading-7 text-slate-400 sm:text-base">
            Legend Killer supplements are built for bodybuilders and athletes who demand clinical dosages, peak absorption, and complete authenticity.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/products" className="btn-primary">Explore All Supplements <ArrowRight size={17} /></Link>
            <Link to="/faq" className="btn-outline">Read FAQs</Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#121216] shadow-card">
          <div className="grid grid-cols-[0.72fr_1.28fr] border-b border-slate-800 bg-[#1A1A22] px-4 py-4 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#FFB800] sm:px-6 sm:text-xs">
            <span>Standard Feature</span>
            <span>Legend Killer Guarantee</span>
          </div>
          <div className="divide-y divide-slate-800">
            {checks.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[0.72fr_1.28fr] gap-3 px-4 py-4 text-sm sm:px-6 sm:py-5">
                <span className="font-bold text-white">{label}</span>
                <span className="flex gap-2 leading-6 text-slate-300"><Check size={16} className="mt-1 shrink-0 text-[#FF5500]" /> {value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReadyToShop() {
  return (
    <section className="bg-gradient-to-r from-[#FFB800] via-[#FF5500] to-[#FF1F00] py-10 text-black sm:py-14">
      <div className="container-page flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-black/10 text-black"><Dumbbell size={24} /></span>
          <div>
            <h2 className="text-2xl font-black uppercase text-black sm:text-3xl">Ready to Crush Your Personal Bests?</h2>
            <p className="mt-1 text-sm font-semibold text-black/80">Dominate every rep with Legend Killer supplements engineered for peak performance.</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Link to="/products?bestSeller=true" className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-black px-6 text-sm font-black uppercase tracking-wider text-white transition hover:bg-slate-900">Shop Bestsellers <ArrowRight size={17} /></Link>
          <Link to="/categories" className="inline-flex min-h-12 items-center justify-center rounded border border-black/30 bg-white/20 px-6 text-sm font-black uppercase tracking-wider text-black transition hover:bg-white/40">Browse Categories</Link>
        </div>
      </div>
    </section>
  );
}
