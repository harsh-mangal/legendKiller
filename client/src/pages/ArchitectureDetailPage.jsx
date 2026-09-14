import { Activity, ArrowLeft, ArrowRight, BookOpen, Brain, CheckCircle2, ChevronRight, Droplets, Flame, Lock, Shield, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import RouteMeta from "../components/layout/RouteMeta";
import { ARCHITECTURES } from "../data/architecturesData";
import { architectureApi } from "../services/api";
import NotFoundPage from "./NotFoundPage";

const iconMap = {
  Zap,
  Brain,
  Flame,
  Activity,
  Droplets,
  Shield,
};

export default function ArchitectureDetailPage() {
  const { slug } = useParams();
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [fetchedArch, setFetchedArch] = useState(null);

  useEffect(() => {
    architectureApi
      .getArchitectureBySlug(slug)
      .then((data) => {
        if (data && data.title) {
          setFetchedArch(data);
        }
      })
      .catch(() => {});
  }, [slug]);

  const arch = useMemo(() => {
    if (fetchedArch) return fetchedArch;
    return ARCHITECTURES.find((a) => a.slug === slug || a.id === slug);
  }, [slug, fetchedArch]);

  if (!arch) {
    return <NotFoundPage />;
  }

  const Icon = iconMap[arch.icon] || Zap;
  const activeChapter = arch.chapters[activeChapterIndex] || arch.chapters[0];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-slate-100 pb-24">
      <RouteMeta
        title={`${arch.title} — ${arch.subtitle} | Legend Born Architectures`}
        description={arch.shortDescription}
      />

      {/* Top Breadcrumb & Hero */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-[#121216] via-[#0A0A0C] to-[#0A0A0C] pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className="container-page relative z-10">
          <Link
            to="/architectures"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-[#FFB800] transition"
          >
            <ArrowLeft size={16} />
            <span>Back to All Architectures</span>
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded border border-[#FF5500]/40 bg-[#FF5500]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#FFB800]">
              <Icon size={14} className="text-[#FF5500]" />
              {arch.category}
            </span>
            <span className="rounded border border-slate-800 bg-[#121216] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
              {arch.badge}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
            {arch.title}
          </h1>
          <p className="mt-2 text-base font-bold uppercase tracking-wider text-[#FFB800] sm:text-xl">
            {arch.subtitle}
          </p>

          <p className="mt-4 max-w-4xl text-sm leading-relaxed text-slate-300 sm:text-base font-semibold">
            {arch.overview}
          </p>

          {/* Pillars Summary Bar */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 border border-slate-800 bg-[#121216]/90 p-4 sm:p-6">
            {arch.pillars.map((pillar, idx) => (
              <div key={idx} className="border-l-2 border-[#FF5500] pl-3 py-1">
                <p className="text-[9px] font-black uppercase text-[#FFB800] tracking-widest">Pillar {idx + 1}</p>
                <p className="text-xs font-black text-white uppercase">{pillar.name}</p>
                <p className="text-[10px] font-bold text-slate-400">{pillar.ingredient}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Layout with Sidebar Chapter Navigation */}
      <section className="container-page mt-10">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* Sidebar - Chapter Navigation */}
          <aside className="space-y-6">
            <div className="sticky top-28 rounded-none border border-slate-800 bg-[#121216] p-5">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <BookOpen size={18} className="text-[#FF5500]" />
                <h2 className="text-xs font-black uppercase tracking-widest text-white">
                  Table of Chapters ({arch.chapters.length})
                </h2>
              </div>

              <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-1 touch-scroll pr-1">
                {arch.chapters.map((chap, idx) => {
                  const isActive = idx === activeChapterIndex;
                  return (
                    <button
                      key={chap.number}
                      type="button"
                      onClick={() => setActiveChapterIndex(idx)}
                      className={`w-full flex items-start gap-3 p-2.5 text-left text-xs font-bold transition border-l-2 ${
                        isActive
                          ? "border-[#FF5500] bg-[#1A1A22] text-[#FFB800]"
                          : "border-transparent text-slate-400 hover:border-slate-700 hover:bg-[#181820] hover:text-white"
                      }`}
                    >
                      <span className={`shrink-0 font-black text-[10px] ${isActive ? "text-[#FF5500]" : "text-slate-500"}`}>
                        CH {chap.number}
                      </span>
                      <span className="line-clamp-2 uppercase tracking-wide leading-snug">
                        {chap.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Emergent Outcomes Badge List */}
              <div className="mt-6 border-t border-slate-800 pt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#FFB800] mb-3">
                  Emergent Outcomes Produced
                </p>
                <ul className="space-y-2">
                  {arch.emergentOutcomes.map((outcome, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
                      <CheckCircle2 size={13} className="shrink-0 text-[#FF5500]" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Chapter Content Main Area */}
          <main className="min-w-0">
            <article className="border border-slate-800 bg-[#121216] p-6 sm:p-10 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-[#FF5500] bg-[#FF5500]/10 px-3 py-1 border border-[#FF5500]/30">
                  Chapter {activeChapter.number} of {arch.chapters.length}
                </span>
                <span className="text-xs font-bold uppercase text-slate-400">
                  Legend Slayer™ Science
                </span>
              </div>

              <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl leading-snug">
                {activeChapter.title}
              </h2>

              {/* Formatted Text Content */}
              <div className="mt-8 space-y-6 text-sm text-slate-200 leading-relaxed font-normal">
                {activeChapter.content.split("\n\n").map((paragraph, pIdx) => {
                  const isLockedDef = paragraph.includes("🔒");
                  const cleanText = paragraph.replace(/🔒/g, "").trim();

                  if (!cleanText) return null;

                  if (isLockedDef) {
                    return (
                      <div
                        key={pIdx}
                        className="my-6 rounded-none border border-[#FF5500]/60 bg-[#FF5500]/10 p-5 text-slate-100 font-semibold shadow-lg relative overflow-hidden"
                      >
                        <div className="flex items-center gap-2 text-[#FFB800] text-xs font-black uppercase tracking-widest mb-2">
                          <Lock size={14} className="text-[#FF5500]" />
                          <span>Locked Scientific Definition</span>
                        </div>
                        <p className="text-sm leading-relaxed text-white font-bold">{cleanText}</p>
                      </div>
                    );
                  }

                  if (paragraph.startsWith("### ")) {
                    return (
                      <h3
                        key={pIdx}
                        className="text-lg font-black uppercase tracking-wider text-[#FFB800] border-b border-slate-800/80 pb-2 pt-4"
                      >
                        {paragraph.replace("### ", "")}
                      </h3>
                    );
                  }

                  if (paragraph.startsWith("- ")) {
                    const listItems = paragraph.split("\n").map((li) => li.replace("- ", "").trim());
                    return (
                      <ul key={pIdx} className="space-y-2 my-4 pl-2">
                        {listItems.map((item, lIdx) => (
                          <li key={lIdx} className="flex items-start gap-2 text-sm text-slate-200 font-medium">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF5500]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  if (paragraph.includes("→")) {
                    return (
                      <div
                        key={pIdx}
                        className="my-4 border border-slate-800 bg-[#0A0A0C] p-4 text-center text-xs font-black uppercase tracking-wider text-[#FFB800]"
                      >
                        {paragraph}
                      </div>
                    );
                  }

                  return (
                    <p key={pIdx} className="text-slate-300 font-medium leading-relaxed">
                      {cleanText}
                    </p>
                  );
                })}
              </div>

              {/* Bottom Pagination Controls */}
              <div className="mt-12 flex items-center justify-between border-t border-slate-800 pt-6">
                <button
                  type="button"
                  disabled={activeChapterIndex === 0}
                  onClick={() => setActiveChapterIndex((curr) => Math.max(0, curr - 1))}
                  className="btn-outline flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase disabled:opacity-30"
                >
                  <ArrowLeft size={16} />
                  <span>Previous Chapter</span>
                </button>

                <span className="text-xs font-bold text-slate-400">
                  {activeChapterIndex + 1} / {arch.chapters.length}
                </span>

                <button
                  type="button"
                  disabled={activeChapterIndex === arch.chapters.length - 1}
                  onClick={() => setActiveChapterIndex((curr) => Math.min(arch.chapters.length - 1, curr + 1))}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase disabled:opacity-30"
                >
                  <span>Next Chapter</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </article>
          </main>
        </div>
      </section>
    </div>
  );
}
