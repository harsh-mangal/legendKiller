import { useEffect, useState } from "react";
import { Activity, ArrowRight, Brain, Droplets, Flame, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import RouteMeta from "../components/layout/RouteMeta";
import { ARCHITECTURES } from "../data/architecturesData";
import { architectureApi } from "../services/api";

const iconMap = {
  Zap,
  Brain,
  Flame,
  Activity,
  Droplets,
  Shield,
};

export default function ArchitecturesPage() {
  const [architectures, setArchitectures] = useState(ARCHITECTURES);

  useEffect(() => {
    architectureApi
      .getArchitectures()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setArchitectures(data);
        }
      })
      .catch(() => {});
  }, []);
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-slate-100 pb-20">
      <RouteMeta
        title="Legend Slayer™ Performance Architectures | Legend Born"
        description="Explore the 6 performance architectures powering Legend Slayer™: The Viper Protocol™. Bioenergetics, neural drive, thermogenesis, nitric oxide, and hydration."
      />

      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-[#121216] via-[#0A0A0C] to-[#0A0A0C] py-16 sm:py-24">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#FF5500]/10 blur-3xl pointer-events-none" />
        
        <div className="container-page relative z-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF5500]/40 bg-[#FF5500]/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#FFB800] backdrop-blur-md">
            <Zap size={14} className="text-[#FF5500] animate-pulse" />
            Legend Slayer™: The Viper Protocol™
          </div>

          <h1 className="mt-6 text-3xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
            Integrated Performance <span className="bg-gradient-to-r from-[#FFB800] via-[#FF5500] to-[#FF1F00] bg-clip-text text-transparent">Architectures</span>
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-sm font-bold text-slate-300 leading-relaxed sm:text-base">
            Explore six architecture documents covering energy, focus, thermogenesis, nitric oxide, pump, and hydration.
          </p>
        </div>
      </section>

      {/* Architecture Cards Grid */}
      <section className="container-page mt-12 sm:mt-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {architectures.map((arch) => {
            const Icon = iconMap[arch.icon] || Zap;
            return (
              <div
                key={arch.id}
                className="group relative flex flex-col justify-between rounded-none border border-slate-800 bg-[#121216] p-6 sm:p-8 transition duration-300 hover:border-[#FF5500] hover:shadow-[0_10px_30px_rgba(255,85,0,0.15)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden border border-slate-800 bg-[#0A0A0C] text-[#FFB800] transition duration-300 group-hover:border-[#FF5500]">
                      {arch.logoUrl ? <img src={arch.logoUrl} alt="" className="h-full w-full scale-[2.2] object-cover" /> : <Icon size={24} />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5500] bg-[#FF5500]/10 px-3 py-1 border border-[#FF5500]/30">
                      {arch.badge}
                    </span>
                  </div>

                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#FFB800]">
                    {arch.category}
                  </p>
                  <h2 className="mt-1 text-xl font-black uppercase text-white tracking-wide group-hover:text-[#FFB800] transition">
                    {arch.title}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                    {arch.subtitle}
                  </p>

                  <p className="mt-4 text-xs text-slate-300 leading-relaxed font-semibold">
                    {arch.shortDescription}
                  </p>

                  {/* Pillars overview */}
                  <div className="mt-6 space-y-2 border-t border-slate-800/80 pt-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Key Functional Pillars:</p>
                    <ul className="space-y-1.5">
                      {arch.pillars.slice(0, 3).map((pillar, index) => (
                        <li key={index} className="flex items-center gap-2 text-xs font-bold text-slate-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF5500]" />
                          <span className="text-white">{pillar.name}</span>
                          <span className="text-slate-500 text-[10px]">({pillar.ingredient})</span>
                        </li>
                      ))}
                      {arch.pillars.length > 3 && (
                        <li className="text-[10px] font-bold text-[#FFB800] uppercase tracking-wider pl-3.5">
                          + {arch.pillars.length - 3} More Pillars
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-800 pt-5">
                  <Link
                    to={`/architectures/${arch.slug}`}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-xs font-black uppercase"
                  >
                    <span>Read Architecture Science</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Integration Philosophy */}
      <section className="container-page mt-20">
        <div className="border border-slate-800 bg-[#121216] p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-[#FFB800]/10 blur-3xl pointer-events-none" />
          <p className="text-xs font-black uppercase text-[#FFB800] tracking-[0.25em]">Legend Slayer System Blueprint 🔒</p>
          <h3 className="mt-2 text-2xl font-black uppercase text-white sm:text-3xl">
            System Engineering vs Isolated Ingredients
          </h3>
          <p className="mt-4 max-w-4xl text-sm leading-relaxed text-slate-300 font-medium">
            Legend Slayer™: The Viper Protocol™ brings together architectures for energy regeneration, neural drive, thermogenic activity, nitric oxide pathways, and hydration.
          </p>
        </div>
      </section>
    </div>
  );
}
