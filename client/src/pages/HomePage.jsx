import { useEffect, useState } from "react";
import {
  ArrowRight,
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
import ProductImage from "../components/ui/ProductImage";
import { COMMERCE } from "../config/commerce";
import { useAuth } from "../context/AuthContext";
import { categoryApi } from "../services/api";
import { money } from "../utils/format";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <Hero />

      <ShoppingBenefits />

      <QuickCategories />

      <ProductShelf
        eyebrow="Individual products"
        title="Best-selling single products"
        description="Start with individual products customers return to most often, then explore value combos below."
        params={{
          bestSeller: "true",
          sort: "featured",
        }}
        viewAllUrl="/products?bestSeller=true"
      />

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

function QuickCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    categoryApi
      .getCategories({
        signal: controller.signal,
      })
      .then((items) => {
        if (active) {
          setCategories(Array.isArray(items) ? items : []);
        }
      })
      .catch(() => {
        if (active) {
          setCategories([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  if (!loading && categories.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-slate-100 bg-white py-7 sm:py-10">
      <div className="container-page">
        <div className="mb-5 flex items-end justify-between gap-3 sm:mb-7">
          <div className="min-w-0">
            <p className="section-eyebrow">Quick shop</p>

            <h2 className="mt-1 font-display text-[24px] font-semibold leading-tight text-slate-950 sm:text-3xl">
              Shop by category
            </h2>
          </div>

          <Link
            to="/categories"
            className="
              inline-flex shrink-0 items-center gap-1
              whitespace-nowrap text-[11px] font-extrabold
              uppercase tracking-[0.1em] text-veda-leaf
              transition hover:text-veda-copper
              sm:gap-1.5 sm:text-xs sm:tracking-[0.12em]
            "
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        <div
          className="
            touch-scroll -mx-4 flex snap-x snap-mandatory
            gap-3 overflow-x-auto px-4 pb-2
            sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0
            lg:justify-start
          "
        >
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="
                    h-[142px] w-[112px] shrink-0
                    animate-pulse snap-start rounded-2xl
                    border border-slate-200 bg-slate-100
                    sm:h-[154px] sm:w-[128px]
                  "
                />
              ))
            : categories.slice(0, 6).map((category) => (
                <Link
                  key={category._id}
                  to={`/categories/${category.slug}`}
                  aria-label={`Shop ${category.name}`}
                  className="
                    group flex w-[112px] shrink-0 snap-start
                    flex-col rounded-2xl border border-slate-200
                    bg-white p-2 shadow-sm transition duration-200
                    hover:-translate-y-1 hover:border-veda-gold
                    hover:shadow-md
                    sm:w-[128px] sm:p-2.5
                  "
                >
                  <div
                    className="
                      flex h-[92px] items-center justify-center
                      overflow-hidden rounded-xl bg-slate-50
                      sm:h-[104px]
                    "
                  >
                    <ProductImage
                      src={category.image}
                      alt={category.name}
                      className="
                        h-full w-full object-contain p-1
                        transition duration-300
                        group-hover:scale-[1.05]
                      "
                      fallbackClassName="h-full w-full"
                    />
                  </div>

                  <span
                    className="
                      mt-2 flex min-h-8 items-center justify-center
                      overflow-hidden text-center text-[11px]
                      font-bold leading-4 text-slate-800
                      sm:text-xs
                    "
                  >
                    {category.name}
                  </span>
                </Link>
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
