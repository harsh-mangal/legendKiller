import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";
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
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef(null);

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

  useEffect(() => {
    if (!containerRef.current) return;
    const videos = containerRef.current.querySelectorAll("video");
    videos.forEach((video) => {
      video.muted = isMuted;
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
    });
  }, [isMuted, activeIndex]);

  if (loading) {
    return (
      <section
        className="w-full aspect-[1920/960] sm:aspect-[1920/540] animate-pulse bg-[#0A0A0C]"
        role="status"
        aria-label="Loading banners"
      />
    );
  }

  if (!banners.length) return null;

  const activeBanner = banners[activeIndex];
  const hasActiveVideo =
    activeBanner &&
    (activeBanner.mediaType === "video" ||
      activeBanner.mobileMediaType === "video" ||
      isVideoMedia(activeBanner.image) ||
      isVideoMedia(activeBanner.mobileImage));

  const toggleMute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full aspect-[1920/960] sm:aspect-[1920/540] overflow-hidden bg-[#0A0A0C] border-b border-slate-800"
      aria-label="Promotional hero banners"
    >
      {banners.map((banner, index) => {
        const isDesktopVideo =
          banner.mediaType === "video" || isVideoMedia(banner.image);
        const hasMobileMedia = Boolean(banner.mobileImage);
        const isMobileVideo =
          banner.mobileMediaType === "video" ||
          isVideoMedia(banner.mobileImage);

        const renderDesktopMedia = () =>
          isDesktopVideo ? (
            <video
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
              aria-label={banner.title || `Promotional video ${index + 1}`}
            >
              <source src={banner.image} />
            </video>
          ) : (
            <ProductImage
              src={banner.image}
              alt={banner.title || `Banner ${index + 1}`}
              loading={index === 0 ? "eager" : "lazy"}
              className="h-full w-full object-cover"
              fallbackClassName="h-full w-full bg-[#0A0A0C]"
            />
          );

        const renderMobileMedia = () => {
          if (!hasMobileMedia) return renderDesktopMedia();

          return isMobileVideo ? (
            <video
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
              aria-label={
                banner.title || `Promotional mobile video ${index + 1}`
              }
            >
              <source src={banner.mobileImage} />
            </video>
          ) : (
            <ProductImage
              src={banner.mobileImage}
              alt={banner.title || `Banner mobile ${index + 1}`}
              loading={index === 0 ? "eager" : "lazy"}
              className="h-full w-full object-cover"
              fallbackClassName="h-full w-full bg-[#0A0A0C]"
            />
          );
        };

        const mediaContent = (
          <div className="h-full w-full">
            {hasMobileMedia ? (
              <>
                <div className="block sm:hidden h-full w-full">
                  {renderMobileMedia()}
                </div>
                <div className="hidden sm:block h-full w-full">
                  {renderDesktopMedia()}
                </div>
              </>
            ) : (
              renderDesktopMedia()
            )}
          </div>
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

      {hasActiveVideo && (
        <button
          type="button"
          onClick={toggleMute}
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
        <div className="absolute bottom-2 sm:bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {banners.map((banner, index) => (
            <button
              key={banner._id || index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show promotional banner ${index + 1}`}
              aria-current={index === activeIndex}
              className={`h-1 sm:h-1.5 transition-all duration-300 ${
                index === activeIndex
                  ? "w-6 sm:w-8 bg-[#FF5500]"
                  : "w-2 sm:w-2.5 bg-white/40 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
