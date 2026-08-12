import {
  ArrowRight,
  Zap,
  Dumbbell,
  Flame,
  Activity,
  ShieldCheck,
  Award,
  Sparkles,
  Check,
  Search,
  ClipboardCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const goals = [
  {
    icon: Dumbbell,
    title: "Muscle Building & Isolates",
    description: "Ultra-pure Whey Isolate & Hydrolysate for maximum protein synthesis.",
    to: "/categories/whey-protein-isolates",
    tone: "bg-amber-500/10 text-[#FFB800]",
  },
  {
    icon: Zap,
    title: "Explosive Pre-Workout",
    description: "High-caffeine, L-Citrulline, and Beta-Alanine pump matrix.",
    to: "/categories/pre-workout-energy",
    tone: "bg-orange-500/10 text-[#FF5500]",
  },
  {
    icon: Activity,
    title: "Creatine & Strength",
    description: "100% Micronized Creatine Monohydrate for ATP regeneration & power.",
    to: "/categories/creatine-anabolic-builders",
    tone: "bg-red-500/10 text-[#FF1F00]",
  },
  {
    icon: Award,
    title: "Heavyweight Mass Gainers",
    description: "1250+ Calorie bulking formulas with 50g protein and complex carbs.",
    to: "/categories/mass-gainers-heavyweight-carbs",
    tone: "bg-amber-500/10 text-[#FFB800]",
  },
  {
    icon: Sparkles,
    title: "BCAA & Intra-Workout",
    description: "2:1:1 BCAA ratio with Coconut Water electrolytes for muscle recovery.",
    to: "/categories/bcaa-intra-workout",
    tone: "bg-orange-500/10 text-[#FF5500]",
  },
  {
    icon: Flame,
    title: "Fat Burners & Essentials",
    description: "Thermogenic fat incinerators, Triple Strength Omega-3 & Multivitamins.",
    to: "/categories/fat-burners-essentials",
    tone: "bg-red-500/10 text-[#FF1F00]",
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
  return (
    <section className="border-y border-slate-800 bg-[#0A0A0C] py-12 text-white sm:py-20">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <div>
            <p className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-[#FFB800]">
              <span className="h-0.5 w-8 bg-gradient-to-r from-[#FFB800] to-[#FF5500]" /> Fuel Your Greatness
            </p>
            <h2 className="mt-4 max-w-lg font-display text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
              Target Your Training Protocol.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-400 sm:text-base">
              Engineered with raw imported ingredients, clinical dosages, and zero filler. Select your fitness objective below.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">
            {goals.map(({ icon: Icon, title, description, to, tone }) => (
              <Link
                key={title}
                to={to}
                className="group relative min-h-48 overflow-hidden rounded-xl border border-slate-800 bg-[#121216] p-4 transition duration-300 hover:-translate-y-1 hover:border-[#FF5500] hover:bg-[#1A1A22] sm:min-h-52 sm:p-5"
              >
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}>
                  <Icon size={20} strokeWidth={2.2} />
                </span>
                <h3 className="mt-5 text-base font-bold text-white sm:text-lg">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-400 sm:text-sm sm:leading-6">{description}</p>
                <ArrowRight className="absolute bottom-4 right-4 text-[#FFB800] transition group-hover:translate-x-1" size={18} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
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
