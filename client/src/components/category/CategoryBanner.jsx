import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import ProductImage from "../ui/ProductImage";

const isVideoMedia = (value) => /\.(mp4|webm|mov|ogg|mkv)($|\?)/i.test(value || "");

export default function CategoryBanner({ banners = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((value) => (value + 1) % banners.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (!containerRef.current) return;
    const slides = containerRef.current.querySelectorAll("[data-slide-index]");
    slides.forEach((slide) => {
      const index = Number(slide.getAttribute("data-slide-index"));
      slide.querySelectorAll("video").forEach((video) => {
        video.muted = isMuted;
        const isVisible =
          video.offsetParent !== null &&
          window.getComputedStyle(video).display !== "none" &&
          window.getComputedStyle(video.parentElement).display !== "none";

        if (index === activeIndex && isVisible) {
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
  }, [activeIndex, banners, isMuted]);

  if (!banners.length) return null;

  const activeBanner = banners[activeIndex];
  const activeBannerIsVideo = Boolean(
    activeBanner &&
      (activeBanner.mediaType === "video" ||
        activeBanner.mobileMediaType === "video" ||
        isVideoMedia(activeBanner.image) ||
        isVideoMedia(activeBanner.mobileImage))
  );

  const renderMedia = (banner, index, mobile) => {
    const source = mobile ? banner.mobileImage || banner.image : banner.image;
    const video = mobile
      ? banner.mobileImage
        ? banner.mobileMediaType === "video" || isVideoMedia(banner.mobileImage)
        : banner.mediaType === "video" || isVideoMedia(banner.image)
      : banner.mediaType === "video" || isVideoMedia(banner.image);

    if (video) {
      return (
        <video
          autoPlay
          loop
          muted={isMuted}
          defaultMuted
          playsInline
          webkit-playsinline="true"
          disablePictureInPicture
          disableRemotePlayback
          controls={false}
          preload="auto"
          className={`pointer-events-none h-full w-full select-none ${mobile ? "object-contain" : "object-cover"}`}
        >
          <source src={source} />
        </video>
      );
    }

    return (
      <ProductImage
        src={source}
        alt={banner.title || `Category promotion${mobile ? " mobile" : ""} ${index + 1}`}
        className={`h-full w-full ${mobile ? "object-contain" : "object-cover"}`}
        fallbackClassName="h-full w-full bg-[#0A0A0C]"
      />
    );
  };

  const wrapMedia = (banner, content) => {
    if (!banner.link) return content;
    if (/^https?:\/\//i.test(banner.link)) {
      return <a href={banner.link} className="block h-full w-full">{content}</a>;
    }
    return <Link to={banner.link} className="block h-full w-full">{content}</Link>;
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-[1920/960] overflow-hidden border-b border-slate-800 bg-[#0A0A0C] sm:aspect-[1920/540]"
    >
      {banners.map((banner, index) => {
        return (
          <div
            key={banner._id || index}
            data-slide-index={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === activeIndex ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
            }`}
            aria-hidden={index !== activeIndex}
          >
            <div className="block h-full w-full sm:hidden">
              {wrapMedia(banner, renderMedia(banner, index, true))}
            </div>

            <div className="hidden h-full w-full sm:block">
              {wrapMedia(banner, renderMedia(banner, index, false))}
            </div>
          </div>
        );
      })}

      {activeBannerIsVideo && (
        <button
          type="button"
          onClick={() => setIsMuted((value) => !value)}
          aria-label={isMuted ? "Unmute video sound" : "Mute video sound"}
          title={isMuted ? "Unmute sound" : "Mute sound"}
          className="absolute right-3 top-3 z-30 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-black/80 active:scale-95"
        >
          {isMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} className="text-emerald-400" />}
          <span>{isMuted ? "Unmute" : "Mute"}</span>
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
  );
}
