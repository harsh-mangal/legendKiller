import { useEffect, useState } from "react";
import { bannerApi } from "../../services/api";
import ProductImage from "../ui/ProductImage";

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
    }, 5000);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (loading) {
    return (
      <section
        className="aspect-[16/6] w-full animate-pulse bg-slate-100"
        role="status"
        aria-label="Loading banners"
      />
    );
  }

  if (!banners.length) return null;

  return (
    <section
      className="relative aspect-[16/6] w-full overflow-hidden bg-slate-100"
      aria-label="Promotional banners"
    >
      {banners.map((banner, index) => (
        <div
          key={banner._id || index}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={index !== activeIndex}
        >
          <picture className="block h-full w-full">
            {banner.mobileImage && (
              <source media="(max-width: 640px)" srcSet={banner.mobileImage} />
            )}

            <ProductImage
              src={banner.image}
              alt={banner.title || `Banner ${index + 1}`}
              loading={index === 0 ? "eager" : "lazy"}
              className="h-full w-full object-cover"
              fallbackClassName="h-full w-full"
            />
          </picture>
        </div>
      ))}
    </section>
  );
}
