import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bannerApi } from "../../services/api";
import ProductImage from "../ui/ProductImage";

const isVideoMedia = (target) => {
  if (!target) return false;
  if (typeof target === "string") {
    return /\.(mp4|webm|mov|ogg|mkv)($|\?)/i.test(target);
  }
  return false;
};

export default function Hero() {
  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    bannerApi
      .getBanners("home", { signal: controller.signal })
      .then((items) => {
        if (active) {
          setBanners(Array.isArray(items) ? items : []);
        }
      })
      .catch(() => {
        if (active) setBanners([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (loading) {
    return (
      <section
        className="w-full aspect-[1920/350] min-h-[140px] sm:min-h-[220px] md:min-h-[280px] lg:min-h-[350px] animate-pulse bg-[#0A0A0C]"
        role="status"
        aria-label="Loading banners"
      />
    );
  }

  if (!banners.length) return null;

  return (
    <section
      className="relative w-full aspect-[1920/350] min-h-[140px] sm:min-h-[220px] md:min-h-[280px] lg:min-h-[350px] overflow-hidden bg-[#0A0A0C] border-b border-slate-800"
      aria-label="Promotional hero banners"
    >
      {banners.map((banner, index) => {
        const isDesktopVideo =
          banner.mediaType === "video" || isVideoMedia(banner.image);
        const isMobileVideo =
          banner.mobileMediaType === "video" ||
          isVideoMedia(banner.mobileImage);

        const mediaContent = isDesktopVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
            aria-label={banner.title || `Promotional video ${index + 1}`}
          >
            {banner.mobileImage && isMobileVideo && (
              <source src={banner.mobileImage} media="(max-width: 640px)" />
            )}
            <source src={banner.image} />
          </video>
        ) : (
          <picture className="block h-full w-full">
            {banner.mobileImage && !isMobileVideo && (
              <source
                media="(max-width: 640px)"
                srcSet={banner.mobileImage}
              />
            )}
            <ProductImage
              src={banner.image}
              alt={banner.title || `Banner ${index + 1}`}
              loading={index === 0 ? "eager" : "lazy"}
              className="h-full w-full object-cover"
              fallbackClassName="h-full w-full bg-[#0A0A0C]"
            />
          </picture>
        );

        return (
          <div
            key={banner._id || index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === activeIndex
                ? "opacity-100 z-10"
                : "pointer-events-none opacity-0 z-0"
            }`}
            aria-hidden={index !== activeIndex}
          >
            {banner.link ? (
              <Link
                to={banner.link}
                className="block h-full w-full"
                aria-label={banner.title || "Banner link"}
              >
                {mediaContent}
              </Link>
            ) : (
              mediaContent
            )}
          </div>
        );
      })}

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {banners.map((banner, index) => (
            <button
              key={banner._id || index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show promotional banner ${index + 1}`}
              aria-current={index === activeIndex}
              className={`h-1.5 transition-all duration-300 ${
                index === activeIndex
                  ? "w-8 bg-[#FF5500]"
                  : "w-2.5 bg-white/40 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
