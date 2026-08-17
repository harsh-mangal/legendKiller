import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Dumbbell,
  ExternalLink,
  Flame,
  Globe,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SITE } from "../config/site";

const principles = [
  [Dumbbell, "100% Raw Imported Whey", "Cross-Flow Microfiltered whey protein isolates with zero amino spiking and zero filler ingredients."],
  [ShieldCheck, "NABL Accredited Lab Reports", "Every single batch is tested for protein purity, heavy metals, and certified free of banned substances."],
  [Zap, "Clinical Dosages", "No proprietary hidden blends. Every ingredient is clearly labeled with exact active milligram dosages."],
  [BadgeCheck, "Built for Elite Athletes", "Formulated specifically for bodybuilders, powerlifters, and high-intensity fitness competitors."],
];

const commitments = [
  [Flame, "Maximum Bioavailability", "Enhanced with DigeZyme multi-enzyme complex for 80% higher amino acid absorption and zero bloating."],
  [BadgeCheck, "Authenticity Scratch Code", "Unique security verification code on every single tub to ensure 100% genuine products."],
  [CheckCircle2, "Fast Express Delivery", "Priority dispatch across 25,000+ Indian pincodes with live SMS and WhatsApp tracking."],
];

const entityFacts = [
  { label: "Legal Entity", value: SITE.legalEntity },
  { label: "Company", value: SITE.companyName || "Legend Born Nutrition" },
  { label: "Brand Name", value: `${SITE.name} (${SITE.tagline})` },
  { label: "Founding Year", value: SITE.foundingDate || "2024" },
  { label: "Headquarters", value: SITE.location },
  { label: "Official Website", value: SITE.url.replace(/^https?:\/\//, "") },
  { label: "Industry", value: "Sports Nutrition & Dietary Supplements" },
  { label: "Operating Region", value: "India & Pan-Asia Distribution" },
];

const officialChannels = [
  { name: "Instagram", handle: "@legendbornnutrition", url: SITE.socials?.instagram || "https://www.instagram.com/legendbornnutrition" },
  { name: "YouTube", handle: "@legendbornnutrition", url: SITE.socials?.youtube || "https://www.youtube.com/@legendbornnutrition" },
  { name: "Twitter / X", handle: "@legendbornnutr", url: SITE.socials?.twitter || "https://twitter.com/legendbornnutr" },
  { name: "LinkedIn", handle: "Legend Born Nutrition", url: SITE.socials?.linkedin || "https://www.linkedin.com/company/legendbornnutrition" },
];

export default function AboutPage() {
  return (
    <section>
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-800 bg-[#0A0A0C]">
        <div className="container-page relative grid gap-9 py-12 sm:py-16 lg:min-h-[560px] lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-12 lg:py-20">
          <div>
            <p className="section-eyebrow">The Viper Protocol</p>
            <h1 className="mt-5 max-w-4xl font-display text-[2.5rem] font-black uppercase leading-[1] text-white sm:mt-6 sm:text-6xl lg:text-7xl">
              Engineered for Legends. Tested for Greatness.
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-300 sm:mt-7 sm:text-base sm:leading-8">
              Legend Killer is India's premium high-performance nutritional supplement brand, engineered for athletes, bodybuilders, and fitness purists who refuse to compromise on quality.
            </p>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-400 sm:text-base sm:leading-8">
              From Cross-Flow Microfiltered Whey Isolates to explosive Pre-Workout matrices and 100% pure Micronized Creatine, every Legend Killer product is engineered with clinical dosages, raw imported ingredients, and complete lab transparency.
            </p>
            <div className="mt-7 grid gap-3 sm:mt-9 sm:flex sm:flex-wrap">
              <Link to="/products" className="btn-primary">Explore Products</Link>
              <Link to="/contact" className="btn-outline">Contact Support</Link>
            </div>
          </div>

          <div className="brand-panel bg-[#121216] p-5 sm:p-10">
            <p className="editorial-kicker">Our Formula Philosophy</p>
            <h2 className="mt-3 font-display text-[1.75rem] font-bold uppercase leading-tight text-white sm:mt-4 sm:text-3xl">
              No Proprietary Blends. No Underdosed Fillers.
            </h2>
            <p className="relative z-10 mt-4 text-sm leading-7 text-slate-400">
              We believe bodybuilders deserve to know exactly what goes into their shakers. Every Legend Killer tub features full label disclosure, premium raw materials sourced from top global suppliers, and rigorous batch quality checks.
            </p>
            <div className="relative z-10 mt-7 border-t border-slate-800">
              {commitments.map(([Icon, title, description]) => (
                <div key={title} className="grid grid-cols-[42px_1fr] gap-4 border-b border-slate-800 py-5">
                  <span className="grid h-10 w-10 place-items-center border border-[#FF5500]/30 bg-[#FF5500]/10 text-[#FFB800]"><Icon size={18} /></span>
                  <div>
                    <h3 className="font-sans text-sm font-bold tracking-normal text-white">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Brand Pillars */}
      <div className="page-section bg-[#121216]">
        <div className="container-page">
          <div className="grid gap-5 border-b border-slate-800 pb-6 sm:gap-8 sm:pb-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <p className="section-eyebrow">The Legend Pillars</p>
            <div>
              <h2 className="section-title">Built on Science. Proven in the Gym.</h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-400">
                Whether you're prepping for the stage, breaking personal strength records, or building lean muscle mass, Legend Killer gives your body the exact anabolic fuel it needs.
              </p>
            </div>
          </div>
          <div className="mt-0 grid gap-px border-x border-b border-slate-800 bg-slate-800 md:grid-cols-2 lg:grid-cols-4">
            {principles.map(([Icon, title, description], index) => (
              <article key={title} className="bg-[#0A0A0C] p-5 sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center border border-slate-800 bg-[#121216] text-[#FF5500]"><Icon size={20} /></span>
                  <span className="font-display text-xl font-black text-[#FFB800]">0{index + 1}</span>
                </div>
                <h3 className="mt-6 font-sans text-base font-bold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Corporate Entity Home Section for Google Knowledge Graph */}
      <div className="page-section bg-[#0A0A0C] border-t border-slate-800">
        <div className="container-page">
          <div className="grid gap-5 border-b border-slate-800 pb-6 sm:gap-8 sm:pb-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="section-eyebrow">Entity Home &amp; Corporate Identity</p>
              <h2 className="section-title">Official Brand Registry</h2>
            </div>
            <p className="text-sm leading-7 text-slate-400">
              Official corporate registration and verified authority profiles for <strong className="text-white">Legend Born Nutrition</strong> (operating brand <strong className="text-white">Legend Killer</strong>). This page serves as the official Entity Home for search engine knowledge graphs and brand verification.
            </p>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {/* Corporate Profile Card */}
            <div className="border border-slate-800 bg-[#121216] p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Building2 size={24} className="text-[#FF5500]" />
                <h3 className="text-lg font-black uppercase text-white">Corporate Identity</h3>
              </div>
              <dl className="mt-6 divide-y divide-slate-800/80">
                {entityFacts.map(({ label, value }) => (
                  <div key={label} className="grid grid-cols-1 py-3 text-xs sm:grid-cols-[140px_1fr]">
                    <dt className="font-bold uppercase tracking-wider text-slate-400">{label}</dt>
                    <dd className="font-medium text-slate-200 mt-1 sm:mt-0">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Official Digital Channels & sameAs Authority Card */}
            <div className="border border-slate-800 bg-[#121216] p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Globe size={24} className="text-[#FFB800]" />
                <h3 className="text-lg font-black uppercase text-white">Official Verified Channels</h3>
              </div>
              <p className="mt-4 text-xs leading-6 text-slate-400">
                Official social and digital media channels verified and maintained by Legend Born Nutrition:
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {officialChannels.map(({ name, handle, url }) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between border border-slate-800 bg-[#0A0A0C] p-3.5 transition hover:border-[#FF5500] hover:bg-[#181820]"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{name}</p>
                      <p className="text-[11px] text-[#FFB800]">{handle}</p>
                    </div>
                    <ExternalLink size={14} className="text-slate-500" />
                  </a>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-800 pt-5 text-xs text-slate-400">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck size={16} /> FSSAI &amp; GMP Quality Certified
                </div>
                <p className="mt-2 text-[11px] leading-5 text-slate-400">
                  Registered under Indian Food Safety Regulations and manufactured in ISO 22000 compliant facilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vision & Promise */}
      <div className="bg-gradient-to-r from-[#FFB800] via-[#FF5500] to-[#FF1F00] py-10 text-black sm:py-20">
        <div className="container-page grid gap-px bg-black/20 md:grid-cols-2">
          <div className="bg-[#0A0A0C] p-5 sm:p-10 lg:p-12 text-white">
            <p className="editorial-kicker text-[#FFB800]">Brand Vision</p>
            <h2 className="mt-4 font-display text-3xl font-black uppercase text-white">To Power Every Athlete's Absolute Peak.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">To set the benchmark for sports nutrition in India through pure ingredients, advanced digestion technology, and unmatched transparency.</p>
          </div>
          <div className="bg-[#0A0A0C] p-5 sm:p-10 lg:p-12 text-white">
            <p className="editorial-kicker text-[#FFB800]">The Athlete Promise</p>
            <h2 className="mt-4 font-display text-3xl font-black uppercase text-white">Zero Fake Claims. 100% Guaranteed Results.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">Every batch is verified, every scoop is pure, and every order is shipped fast with guaranteed authenticity.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
