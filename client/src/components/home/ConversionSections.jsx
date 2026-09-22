import { useEffect, useState } from "react";
import {
  ArrowRight,
  Droplets,
  Dumbbell,
  ShieldCheck,
  Check,
  Search,
  ClipboardCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { bannerApi } from "../../services/api";
import { Crosshair, FlaskConical, Crown } from "lucide-react";

const featuredGoals = [
  {
    image: "/viper-protocol-pre-workout.webp",
    title: "Pre-Workout",
    to: "/products/legend-slayer-the-viper-protocol",
  },
  {
    icon: Droplets,
    label: "Hydration + recovery",
    title: "Coconut Water",
    description:
      "Electrolyte-rich hydration support for endurance, recovery, and sustained performance.",
    to: "/categories/coconut-water",
  },
];

const journey = [
  {
    icon: Crosshair,
    step: "01",
    title: "Enter The Protocol",
    description:
      "Select the architecture aligned with your performance mission.",
    keywords: ["Define", "Choose", "Commit"],
  },
  {
    icon: FlaskConical,
    step: "02",
    title: "Decode The Formula",
    description:
      "Explore the ingredients, patents, and performance systems behind every matrix.",
    keywords: ["Transparency", "Science", "Purpose"],
  },
  {
    icon: Crown,
    step: "03",
    title: "Execute The Architecture",
    description:
      "Deploy a complete performance architecture where every ingredient, pathway, and matrix works as one unified system.",
    keywords: ["Perform", "Evolve", "Lead"],
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
    <section className="border-y border-slate-800 bg-[#0A0A0C] py-8 text-white">
      <div className="container-page">
        <div
          className={`grid gap-8 lg:items-start ${protocolBanner ? "lg:grid-cols-[1.15fr_0.85fr] lg:gap-12" : "max-w-3xl"}`}
        >
          <div>
            <p className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-[#FFB800]">
              <span className="h-0.5 w-8 bg-gradient-to-r from-[#FFB800] to-[#FF5500]" />{" "}
              READY TO ENTER
            </p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-black uppercase leading-tight text-white sm:text-4xl italic">
              THE VIPER <br />
              <span className="text-[#FFB800]">PROTOCOL</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Attack every workout with relentless precision and unlock
              extraordinary results.
            </p>

            <nav
              className="mt-5 border-y border-slate-800"
              aria-label="Featured performance categories"
            >
              {featuredGoals.map(
                ({ icon: Icon, image, label, title, description, to }) => (
                  <Link
                    key={title}
                    to={to}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-slate-800 py-4 transition-colors last:border-b-0 hover:text-[#FFB800] sm:gap-5 sm:py-5"
                  >
                    {image ? (
                      <span className="h-20 w-20 shrink-0 overflow-hidden border border-[#FF5500]/50 bg-black sm:h-24 sm:w-24">
                        <img
                          src={image}
                          alt="Legend Slayer The Viper Protocol pre-workout"
                          className="h-full w-full object-cover"
                        />
                      </span>
                    ) : (
                      <span className="grid h-12 w-12 place-items-center border border-[#FF5500]/40 bg-[#FF5500]/10 text-[#FFB800] sm:h-14 sm:w-14">
                        <Icon size={23} strokeWidth={2.2} />
                      </span>
                    )}
                    <span>
                      {label && (
                        <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#FF5500]">
                          {label}
                        </span>
                      )}
                      <span className={`${label ? "mt-1" : ""} block font-display text-xl font-black uppercase text-white sm:text-2xl`}>
                        {title}
                      </span>
                      {description && (
                        <span className="mt-1 block text-sm leading-6 text-slate-300">
                          {description}
                        </span>
                      )}
                    </span>
                    <ArrowRight
                      className="text-[#FFB800] transition-transform group-hover:translate-x-1"
                      size={21}
                    />
                  </Link>
                ),
              )}
            </nav>
          </div>

          {protocolBanner && (
            <div className="relative aspect-square w-full max-w-[400px] overflow-hidden border border-slate-800 bg-[#121216] shadow-card lg:mt-32 lg:justify-self-center">
              {protocolBanner.link ? (
                <Link
                  to={protocolBanner.link}
                  className="group block h-full w-full"
                >
                  {renderProtocolMedia(
                    protocolBanner,
                    isDesktopVideo,
                    isMobileVideo,
                  )}
                </Link>
              ) : (
                renderProtocolMedia(
                  protocolBanner,
                  isDesktopVideo,
                  isMobileVideo,
                )
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
        {/* Heading */}
        <div className="mx-auto max-w-4xl text-center">
          <p className="section-eyebrow justify-center before:hidden">
            The Viper Protocol
          </p>

          <h2 className="mt-3 font-display text-3xl font-black uppercase text-white sm:text-5xl">
            3 Steps to <span className="text-[#FF5500]">Human Advancement</span>
          </h2>

          <p className="mt-4 text-sm text-slate-400 sm:text-base">
            The Science Behind Every Milligram. The Purpose Behind Every
            Inclusion.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-10 grid gap-4 md:grid-cols-3 md:gap-0">
          <div
            className="absolute left-[16.67%] right-[16.67%] top-9 hidden h-0.5 bg-gradient-to-r from-[#FFB800] via-[#FF5500] to-[#FF1F00] md:block"
            aria-hidden="true"
          />

          {journey.map(({ icon: Icon, step, title, description, keywords }) => (
            <article
              key={step}
              className="relative z-10 flex flex-col rounded-xl border border-slate-800 bg-[#121216] p-6 text-center shadow-card md:mx-3 md:p-8"
            >
              {/* Icon */}
              <span className="mx-auto grid h-[72px] w-[72px] place-items-center rounded-full border border-[#FF5500] bg-[#0A0A0C] text-[#FFB800]">
                <Icon size={28} strokeWidth={2} />
              </span>

              {/* Step */}
              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#FF5500]">
                Step {step}
              </p>

              {/* Title */}
              <h3 className="mt-2 text-xl font-black uppercase leading-tight text-white sm:text-2xl">
                {title}
              </h3>

              {/* Description */}
              <p className="mt-4 flex-1 text-sm leading-6 text-slate-400">
                {description}
              </p>

              {/* Bottom keywords */}
              <div className="mt-7 border-t border-[#FF5500]/60 pt-5">
                <div className="flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-300 sm:gap-3">
                  {keywords.map((keyword, index) => (
                    <div
                      key={keyword}
                      className="flex items-center gap-2 sm:gap-3"
                    >
                      <span>{keyword}</span>

                      {index !== keywords.length - 1 && (
                        <span className="text-[#FF5500]">›</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClarityComparison() {
  const checks = [
    {
      title: "Ingredient Sovereignty",
      subtitle: "Every Ingredient Earns Its Place",
      commitment:
        "Every ingredient is selected to serve a defined physiological purpose, supported by a clear clinical rationale and performance contribution. Every ingredient has a purpose. Every milligram earns its place in the formulation.",
    },
    {
      title: "Future-State Engineering",
      subtitle: "Innovation Engineered for the Standards of Tomorrow",
      commitment:
        "Every system is designed beyond current category expectations, anticipating the future of human performance rather than following today’s trends.",
    },
    {
      title: "Global Intelligence Network",
      subtitle: "Precision in Formulation. Sourced from the World’s Finest",
      commitment:
        "A curated network of patented ingredients, advanced raw materials, and internationally recognized innovators unified within a single performance architecture.",
    },
    {
      title: "Architectural Formulation",
      subtitle: "Built as a System, Not a Supplement",
      commitment:
        "Every matrix is engineered to function as an integrated performance ecosystem where each pathway strengthens the next.",
    },
    {
      title: "Physiological Precision",
      subtitle: "Every Milligram Has a Mission",
      commitment:
        "Every inclusion level is precisely calibrated to support a specific biological pathway, performance mechanism, or adaptive response.",
    },
    {
      title: "Performance Without Redundancy",
      subtitle: "Nothing Added for Appearance. Everything Added for Purpose.",
      commitment:
        "Engineered to maximize functional efficiency through the strategic integration of ingredients, with each fulfilling a distinct role within the broader performance architecture. Built upon a zero-filler philosophy with complete ingredient transparency and no hidden blends.",
    },
  ];

  return (
    <section className="border-y border-slate-800 bg-[#0A0A0C] py-12 sm:py-20">
      <div className="container-page grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
        {/* Left Headlines */}
        <div className="space-y-8">
          <h2 className="font-display text-2xl font-black uppercase leading-tight text-white sm:text-4xl">
            Precision in Formulation.
            <span className="block text-[#FF5500]">
              Sourced from the World&apos;s Finest.
            </span>
          </h2>

          <h2 className="font-display text-2xl font-black uppercase leading-tight text-white sm:text-4xl">
            Every Innovation Engineered
            <span className="block text-[#FF5500]">
              Beyond Human Expectation.
            </span>
          </h2>

          <h2 className="font-display text-2xl font-black uppercase leading-tight text-white sm:text-4xl">
            For the Extraordinary Who Choose
            <span className="block text-[#FF5500]">Quality Over Savings.</span>
          </h2>
        </div>

        {/* Foundation Table */}
        {/* Foundation Table */}
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#121216] shadow-card">
          {/* Header */}
          <div className="grid grid-cols-[0.72fr_1.28fr] border-b border-slate-700 bg-[#1A1A22] px-4 py-3 text-[9px] font-extrabold uppercase tracking-[0.18em] text-white sm:px-5 sm:text-[10px]">
            <span>Legend Born Foundation</span>
            <span>Legend Born Commitment</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-800">
            {checks.map(({ title, subtitle, commitment }) => (
              <div
                key={title}
                className="grid grid-cols-1 gap-3 px-4 py-3 sm:px-5 md:grid-cols-[0.72fr_1.28fr] md:gap-5"
              >
                {/* Foundation */}
                <div className="flex flex-col justify-center md:border-r md:border-slate-700 md:pr-5">
                  <h3 className="text-sm font-bold leading-tight text-white sm:text-[15px]">
                    {title}
                  </h3>

                  <p className="mt-1 text-[11px] leading-4 text-slate-400 sm:text-xs">
                    {subtitle}
                  </p>
                </div>

                {/* Commitment */}
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-slate-500 text-white">
                    <Check size={12} strokeWidth={3} />
                  </span>

                  <p className="text-[11px] leading-[1.45] text-slate-300 sm:text-xs">
                    {commitment}
                  </p>
                </div>
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
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-black/10 text-black">
            <Dumbbell size={24} />
          </span>
          <div>
            <h2 className="text-2xl font-black uppercase text-black sm:text-3xl">
              Ready to Annnounce your arrival?
            </h2>
            <p className="mt-1 text-sm font-semibold text-black/80">
              The future has been formulated. The standards have been set. The
              stage is yours. Now step forward and let the world witness your
              arrival. Where world-class ingredients, globally patented
              innovations, and architectural design converge into one unified
              human performance system.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Link
            to="/products/legend-slayer-the-viper-protocol"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-black px-6 text-sm font-black uppercase tracking-wider text-white transition hover:bg-slate-900"
          >
            Shop Pre-Workout <ArrowRight size={17} />
          </Link>
          <Link
            to="/products"
            className="inline-flex min-h-12 items-center justify-center rounded border border-black/30 bg-white/20 px-6 text-sm font-black uppercase tracking-wider text-black transition hover:bg-white/40"
          >
            Shop All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
