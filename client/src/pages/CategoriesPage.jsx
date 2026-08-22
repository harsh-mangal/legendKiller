import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";
import Seo, { absoluteUrl } from "../components/seo/Seo";
import ProductImage from "../components/ui/ProductImage";
import Alert from "../components/ui/Alert";
import { EmptyState } from "../components/ui/PageState";
import { bannerApi, categoryApi } from "../services/api";
import { SITE } from "../config/site";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const bannerContainerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    Promise.all([
      categoryApi.getCategories({ signal: controller.signal }),
      bannerApi.getBanners("categories", { signal: controller.signal }).catch(() => []),
    ])
      .then(([categoryItems, bannerItems]) => {
        if (!active) return;
        setCategories(categoryItems);
        setBanners(bannerItems);
      })
      .catch((requestError) => {
        if (active && requestError?.name !== "AbortError") setError("Categories could not be loaded. Please try again.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const timer = window.setInterval(() => setActiveIndex((value) => (value + 1) % banners.length), 5000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (!bannerContainerRef.current) return;
    const slides = bannerContainerRef.current.querySelectorAll("[data-slide-index]");
    slides.forEach((slide) => {
      const idx = Number(slide.getAttribute("data-slide-index"));
      const videos = slide.querySelectorAll("video");
      videos.forEach((video) => {
        video.muted = isMuted;
        if (idx === activeIndex) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              if (!isMuted) {
                video.muted = true;
                setIsMuted(true);
                video.play().catch(() => {});
              }
            });
          }
        } else {
          video.pause();
        }
      });
    });
  }, [isMuted, activeIndex]);

  return (
    <section className="pb-10 sm:pb-16 bg-[#0A0A0C]">
      {!loading && (
        <Seo
          title={`Shop Sports Nutrition Categories | ${SITE.name}`}
          description={`Browse ${SITE.name} protein isolates, pre-workouts, creatine, and mass gainers by fitness goal.`}
          canonicalPath="/categories"
          indexable
          structuredData={[{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Supplement Categories | ${SITE.name}`,
            url: absoluteUrl("/categories"),
            mainEntity: {
              "@type": "ItemList",
              itemListElement: categories.map((category, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: category.name,
                url: absoluteUrl(`/categories/${category.slug}`),
              })),
            },
          }]}
        />
      )}
      {banners.length > 0 && (
        <div ref={bannerContainerRef} className="relative aspect-[1920/960] sm:aspect-[1920/540] overflow-hidden bg-[#0A0A0C] border-b border-slate-800">
          {banners.map((banner, index) => {
            const isVideo =
              banner.mediaType === "video" ||
              /\.(mp4|webm|mov|ogg|mkv)($|\?)/i.test(banner.image || "");
            const isMobileVideo =
              banner.mobileMediaType === "video" ||
              /\.(mp4|webm|mov|ogg|mkv)($|\?)/i.test(banner.mobileImage || "");

            return (
              <div
                key={banner._id || index}
                data-slide-index={index}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  index === activeIndex
                    ? "opacity-100 z-10"
                    : "pointer-events-none opacity-0 z-0"
                }`}
                aria-hidden={index !== activeIndex}
              >
                <div className="block sm:hidden h-full w-full">
                  {isMobileVideo ? (
                    <video
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    >
                      <source src={banner.mobileImage || banner.image} />
                    </video>
                  ) : (
                    <ProductImage
                      src={banner.mobileImage || banner.image}
                      alt={banner.title || `Category promotion mobile ${index + 1}`}
                      className="h-full w-full object-cover"
                      fallbackClassName="h-full w-full bg-[#0A0A0C]"
                    />
                  )}
                </div>
                <div className="hidden sm:block h-full w-full">
                  {isVideo ? (
                    <video
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    >
                      <source src={banner.image} />
                    </video>
                  ) : (
                    <ProductImage
                      src={banner.image}
                      alt={banner.title || `Category promotion ${index + 1}`}
                      className="h-full w-full object-cover"
                      fallbackClassName="h-full w-full bg-[#0A0A0C]"
                    />
                  )}
                </div>
              </div>
            );
          })}
          {Boolean(
            banners[activeIndex] &&
              (banners[activeIndex].mediaType === "video" ||
                banners[activeIndex].mobileMediaType === "video" ||
                /\.(mp4|webm|mov|ogg|mkv)($|\?)/i.test(banners[activeIndex].image || "") ||
                /\.(mp4|webm|mov|ogg|mkv)($|\?)/i.test(banners[activeIndex].mobileImage || ""))
          ) && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMuted((prev) => !prev);
              }}
              aria-label={isMuted ? "Unmute video sound" : "Mute video sound"}
              title={isMuted ? "Unmute sound" : "Mute sound"}
              className="absolute top-3 right-3 z-30 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md border border-white/20 hover:bg-black/80 transition cursor-pointer shadow-lg active:scale-95"
            >
              {isMuted ? (
                <>
                  <VolumeX size={15} className="text-red-400" />
                  <span>Unmute</span>
                </>
              ) : (
                <>
                  <Volume2 size={15} className="text-emerald-400" />
                  <span>Mute</span>
                </>
              )}
            </button>
          )}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {banners.map((banner, index) => (
                <button
                  key={banner._id || index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show category promotion ${index + 1}`}
                  aria-current={index === activeIndex}
                  className={`h-1.5 transition-all duration-300 ${
                    index === activeIndex ? "w-8 bg-[#FF5500]" : "w-2.5 bg-white/40 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="container-page pt-8 sm:pt-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-eyebrow">Target Your Protocol</p>
            <h1 className="section-title mt-3">Supplement Categories</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">Choose your fitness objective — Whey Isolates, Pre-Workout Energy, Creatine Strength, Heavyweight Mass, or Recovery.</p>
          </div>
          <Link to="/products" className="btn-outline w-full shrink-0 sm:w-auto">Explore All Products</Link>
        </div>

        {loading ? (
          <div className="mt-7 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-40 animate-pulse bg-[#121216] sm:h-48 border border-slate-800" />)}</div>
        ) : error ? (
          <Alert type="error" className="mt-8">{error}</Alert>
        ) : !categories.length ? (
          <div className="mt-8"><EmptyState title="No categories available" description="Please check back later or browse all products." action={<Link to="/products" className="btn-primary">Explore Products</Link>} /></div>
        ) : (
          <div className="mt-7 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => (
              <Link key={category._id} to={`/categories/${category.slug}`} className="group flex min-h-40 flex-col items-center justify-center border border-slate-800 bg-[#121216] p-3.5 text-center shadow-2xl transition hover:border-[#FF5500] sm:min-h-48 rounded-none sm:p-5 sm:hover:-translate-y-1">
                <ProductImage src={category.image} alt={category.name} className="h-16 w-16 object-contain sm:h-24 sm:w-24" fallbackClassName="h-16 w-16 sm:h-24 sm:w-24" />
                <h2 className="mt-3 text-sm font-black uppercase leading-5 text-white group-hover:text-[#FFB800] sm:mt-5 sm:text-base">{category.name}</h2>
                {category.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{category.description}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
