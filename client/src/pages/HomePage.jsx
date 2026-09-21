import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CreditCard,
  Headphones,
  PackageCheck,
  ShoppingBag,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";

import ComboShelf from "../components/home/ComboShelf";
import ConversionSections from "../components/home/ConversionSections";
import Hero from "../components/home/Hero";
import ProductShelf from "../components/home/ProductShelf";
import RecentlyViewed from "../components/home/RecentlyViewed";
import { COMMERCE } from "../config/commerce";
import { useAuth } from "../context/AuthContext";
import { bannerApi } from "../services/api";
import { money } from "../utils/format";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0A0A0C]">
      <h1 className="sr-only">Legend Killer — High Performance Sports Nutrition & Whey Protein Isolates</h1>
      <Hero />

      <ShoppingBenefits />

      <ProductShelf
        eyebrow="More individual choices"
        title="Featured single products"
        description="Popular individual products selected from the active catalogue."
        params={{
          featured: "true",
          sort: "featured",
        }}
        viewAllUrl="/products?featured=true"
        tone="soft"
      />

      <ComboShelf />

      <ConversionSections />

      <RecentlyViewed />

      <AccountStrip />
    </main>
  );
}

function ShoppingBenefits() {
  const [benefitsBanner, setBenefitsBanner] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    bannerApi
      .getBanners("home_benefits", { signal: controller.signal })
      .then((items) => {
        if (active && Array.isArray(items) && items.length > 0) {
          setBenefitsBanner(items[0]);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const items = [
    {
      icon: CreditCard,
      title: "Secure payments",
      description: "Protected checkout",
    },
    {
      icon: PackageCheck,
      title: "Free delivery",
      description: `On orders above ${money(
        COMMERCE.freeShippingThreshold
      )}`,
    },
    {
      icon: BadgeCheck,
      title: "Clear pack details",
      description: "Know exactly what you receive",
    },
    {
      icon: Headphones,
      title: "Order support",
      description: "Help whenever required",
    },
  ];

  if (benefitsBanner) {
    const isDesktopVideo =
      benefitsBanner.mediaType === "video" ||
      /\.(mp4|webm|mov|ogg|mkv)($|\?)/i.test(benefitsBanner.image || "");
    const isMobileVideo =
      benefitsBanner.mobileMediaType === "video" ||
      /\.(mp4|webm|mov|ogg|mkv)($|\?)/i.test(benefitsBanner.mobileImage || "");

    const mediaNode = (
      <div className="relative overflow-hidden border-b border-slate-800 bg-[#0A0A0C]">
        <div className="block sm:hidden w-full">
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
              className="w-full object-cover pointer-events-none select-none"
            >
              <source src={benefitsBanner.mobileImage || benefitsBanner.image} />
            </video>
          ) : (
            <img
              src={benefitsBanner.mobileImage || benefitsBanner.image}
              alt={benefitsBanner.title || "Shopping Benefits Banner"}
              className="w-full object-cover"
            />
          )}
        </div>
        <div className="hidden sm:block w-full">
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
              className="w-full object-cover pointer-events-none select-none"
            >
              <source src={benefitsBanner.image} />
            </video>
          ) : (
            <img
              src={benefitsBanner.image}
              alt={benefitsBanner.title || "Shopping Benefits Banner"}
              className="w-full object-cover"
            />
          )}
        </div>
      </div>
    );

    return benefitsBanner.link ? (
      <Link to={benefitsBanner.link} className="block transition hover:opacity-95">
        {mediaNode}
      </Link>
    ) : (
      mediaNode
    );
  }

  return (
    <section className="hidden border-b border-slate-200 bg-white sm:block">
      <div className="container-page">
        <div className="grid grid-cols-4 divide-x divide-slate-200">
          {items.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex min-h-[88px] min-w-0 items-center gap-3 px-5 py-4 lg:px-7"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-orange-100 bg-orange-50 text-veda-copper">
                <Icon size={18} strokeWidth={1.9} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase leading-4 tracking-[0.1em] text-slate-800">
                  {title}
                </p>

                <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AccountStrip() {
  const { isLoggedIn } = useAuth();

  return (
    <section className="border-t border-slate-200 bg-slate-50 py-7 sm:py-12">
      <div className="container-page">
        <div
          className="
            overflow-hidden rounded-2xl border border-slate-200
            bg-gradient-to-br from-white to-slate-50
            p-5 shadow-sm
            sm:rounded-3xl sm:p-8
            lg:grid lg:grid-cols-[1fr_auto]
            lg:items-center lg:gap-10
          "
        >
          <div>
            <p className="section-eyebrow">
              {isLoggedIn ? "Your account" : "Shop faster next time"}
            </p>

            <h2 className="mt-2 font-display text-[23px] font-semibold leading-tight text-slate-950 sm:text-3xl">
              {isLoggedIn
                ? "Everything related to your shopping, in one place."
                : "Save your details and enjoy a faster checkout."}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {isLoggedIn
                ? "View your orders, saved addresses and wishlist products."
                : "Create an account to manage orders, addresses and your wishlist."}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:mt-0 lg:flex">
            {isLoggedIn ? (
              <>
                <Link
                  to="/orders"
                  className="btn-primary min-h-12 w-full justify-center px-5 lg:w-auto"
                >
                  <ShoppingBag size={17} />
                  My orders
                </Link>

                <Link
                  to="/wishlist"
                  className="btn-outline min-h-12 w-full justify-center px-5 lg:w-auto"
                >
                  Wishlist
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-primary min-h-12 w-full justify-center px-5 lg:w-auto"
                >
                  <UserPlus size={17} />
                  Create account
                </Link>

                <Link
                  to="/login"
                  className="btn-outline min-h-12 w-full justify-center px-5 lg:w-auto"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
