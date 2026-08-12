import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import ProductCard from "../components/product/ProductCard";
import Seo, { absoluteUrl } from "../components/seo/Seo";
import Alert from "../components/ui/Alert";
import { EmptyState } from "../components/ui/PageState";
import { categoryApi, comboApi, productApi } from "../services/api";
import { SITE } from "../config/site";
import { catalogItemPath, isComboCatalogItem } from "../utils/catalog";

const PAGE_SIZE = 8;
const API_FETCH_LIMIT = 100;
const MAX_API_PAGES = 100;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category") || "";

  const selectedType = searchParams.get("type") || "all";

  const urlSearch = searchParams.get("search") || "";

  const featured = searchParams.get("featured") || "";

  const bestSeller = searchParams.get("bestSeller") || "";

  const sort = searchParams.get("sort") || "featured";

  const minPrice = searchParams.get("minPrice") || "";

  const maxPrice = searchParams.get("maxPrice") || "";

  const availability = searchParams.get("availability") || "all";

  const requestedPage = Math.max(
    1,
    Number.parseInt(searchParams.get("page") || "1", 10) || 1,
  );

  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState(urlSearch);
  const [minimumPrice, setMinimumPrice] = useState(minPrice);
  const [maximumPrice, setMaximumPrice] = useState(maxPrice);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    setMinimumPrice(minPrice);
    setMaximumPrice(maxPrice);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    categoryApi
      .getCategories({
        signal: controller.signal,
      })
      .then((response) => {
        if (!active) return;

        const { items } = normalizeApiResponse(response);
        setCategories(items);
      })
      .catch((requestError) => {
        if (
          active &&
          requestError?.name !== "AbortError" &&
          requestError?.code !== "ERR_CANCELED"
        ) {
          setCategories([]);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError("");

    const productPromise = fetchAllApiPages(
            productApi.getProducts,
            {
              search: urlSearch,
              category: selectedCategory,
              featured,
              bestSeller,
              sort,
            },
            controller.signal,
          );

    const comboPromise =
      selectedType === "products"
        ? Promise.resolve([])
        : fetchAllApiPages(
            comboApi.getCombos,
            {
              search: urlSearch,
              category: selectedCategory,
              featured,
            },
            controller.signal,
          );

    Promise.allSettled([productPromise, comboPromise]).then(
      ([productResult, comboResult]) => {
        if (!active) return;

        const productItems =
          productResult.status === "fulfilled" ? productResult.value : [];

        const comboItems =
          comboResult.status === "fulfilled" ? comboResult.value : [];

        setProducts(
          productItems.map((item) => ({
            ...item,
            itemType: item.itemType || "product",
          })),
        );

        setCombos(
          comboItems.map((item) => ({
            ...item,
            itemType: item.itemType || "combo",
          })),
        );

        const productFailed = productResult.status === "rejected";

        const comboFailed =
          selectedType !== "products" && comboResult.status === "rejected";

        const everythingFailed = selectedType === "products"
          ? productFailed
          : productFailed && comboFailed;

        if (everythingFailed) {
          setError(
            "The product catalogue could not be loaded. Please try again.",
          );
        }

        setLoading(false);
      },
    );

    return () => {
      active = false;
      controller.abort();
    };
  }, [urlSearch, selectedCategory, selectedType, featured, bestSeller, sort]);

  const updateParams = (changes, resetPage = true) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(changes).forEach(([key, value]) => {
      const shouldDelete =
        value === "" ||
        value === null ||
        value === undefined ||
        (key === "type" && value === "all") ||
        (key === "sort" && value === "featured") ||
        (key === "availability" && value === "all") ||
        (key === "page" && Number(value) <= 1);

      if (shouldDelete) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    });

    if (resetPage && !Object.prototype.hasOwnProperty.call(changes, "page")) {
      nextParams.delete("page");
    }

    setSearchParams(nextParams);
  };

  const filteredItems = useMemo(() => {
    let baseItems;

    if (selectedType === "products") {
      baseItems = products.filter((item) => !isComboCatalogItem(item));
    } else if (selectedType === "combos") {
      baseItems = [...products.filter(isComboCatalogItem), ...combos];
    } else {
      baseItems = [...products, ...combos];
    }

    const keyword = urlSearch.trim().toLowerCase();

    const minimum = minPrice === "" ? null : Number(minPrice);

    const maximum = maxPrice === "" ? null : Number(maxPrice);

    return baseItems.filter((item) => {
      const searchableText = [
        item.name,
        item.title,
        item.shortDescription,
        item.description,
        item.sku,
        item.brand,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const categorySlugs = getItemCategorySlugs(item);

      const price = getItemPrice(item);
      const inStock = isItemAvailable(item);

      const matchesSearch = !keyword || searchableText.includes(keyword);

      const matchesCategory =
        !selectedCategory || categorySlugs.includes(selectedCategory);

      const matchesMinimum =
        minimum === null || !Number.isFinite(minimum) || price >= minimum;

      const matchesMaximum =
        maximum === null || !Number.isFinite(maximum) || price <= maximum;

      const matchesAvailability =
        availability === "all" ||
        (availability === "in-stock" && inStock) ||
        (availability === "out-of-stock" && !inStock);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMinimum &&
        matchesMaximum &&
        matchesAvailability
      );
    });
  }, [
    products,
    combos,
    selectedType,
    selectedCategory,
    urlSearch,
    minPrice,
    maxPrice,
    availability,
  ]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((firstItem, secondItem) => {
      if (sort === "price-low") {
        return getItemPrice(firstItem) - getItemPrice(secondItem);
      }

      if (sort === "price-high") {
        return getItemPrice(secondItem) - getItemPrice(firstItem);
      }

      if (sort === "rating") {
        return getItemRating(secondItem) - getItemRating(firstItem);
      }

      if (sort === "newest") {
        return (
          new Date(secondItem.createdAt || 0).getTime() -
          new Date(firstItem.createdAt || 0).getTime()
        );
      }

      if (sort === "name-az") {
        return String(firstItem.name || firstItem.title || "").localeCompare(
          String(secondItem.name || secondItem.title || ""),
        );
      }

      const firstFeatured = Number(
        Boolean(firstItem.isFeatured ?? firstItem.featured),
      );

      const secondFeatured = Number(
        Boolean(secondItem.isFeatured ?? secondItem.featured),
      );

      const firstBestSeller = Number(
        Boolean(firstItem.isBestSeller ?? firstItem.bestSeller),
      );

      const secondBestSeller = Number(
        Boolean(secondItem.isBestSeller ?? secondItem.bestSeller),
      );

      return (
        secondFeatured - firstFeatured ||
        secondBestSeller - firstBestSeller ||
        new Date(secondItem.createdAt || 0).getTime() -
          new Date(firstItem.createdAt || 0).getTime()
      );
    });
  }, [filteredItems, sort]);

  const totalItems = sortedItems.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const currentPage = Math.min(requestedPage, totalPages);

  const paginatedItems = useMemo(() => {
    const startingIndex = (currentPage - 1) * PAGE_SIZE;

    return sortedItems.slice(startingIndex, startingIndex + PAGE_SIZE);
  }, [sortedItems, currentPage]);

  const firstVisibleItem =
    totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const lastVisibleItem = Math.min(currentPage * PAGE_SIZE, totalItems);

  const hasActiveFilters =
    Boolean(urlSearch) ||
    Boolean(selectedCategory) ||
    selectedType !== "all" ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    availability !== "all" ||
    sort !== "featured";

  const submitSearch = (event) => {
    event.preventDefault();

    updateParams({
      search: search.trim(),
    });
  };

  const clearSearch = () => {
    setSearch("");

    updateParams({
      search: "",
    });
  };

  const applyPriceFilters = () => {
    let nextMinimum = sanitizePrice(minimumPrice);

    let nextMaximum = sanitizePrice(maximumPrice);

    if (
      nextMinimum !== "" &&
      nextMaximum !== "" &&
      Number(nextMinimum) > Number(nextMaximum)
    ) {
      const oldMinimum = nextMinimum;

      nextMinimum = nextMaximum;
      nextMaximum = oldMinimum;
    }

    setMinimumPrice(nextMinimum);
    setMaximumPrice(nextMaximum);

    updateParams({
      minPrice: nextMinimum,
      maxPrice: nextMaximum,
    });
  };

  const resetFilters = () => {
    const nextParams = new URLSearchParams();

    if (featured) {
      nextParams.set("featured", featured);
    }

    if (bestSeller) {
      nextParams.set("bestSeller", bestSeller);
    }

    setSearch("");
    setMinimumPrice("");
    setMaximumPrice("");
    setSearchParams(nextParams);
  };

  const changePage = (pageNumber) => {
    const nextPage = Math.min(Math.max(pageNumber, 1), totalPages);

    updateParams(
      {
        page: nextPage,
      },
      false,
    );

    window.requestAnimationFrame(() => {
      document.getElementById("catalogue-results")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const catalogueTitle = bestSeller
    ? `Best-Selling Supplements | ${SITE.name}`
    : featured
      ? `Featured Supplements | ${SITE.name}`
      : selectedType === "combos"
        ? `Supplement Stack Bundles | ${SITE.name}`
        : `Protein & Sports Nutrition Supplements | ${SITE.name}`;
  const catalogueDescription = selectedType === "combos"
    ? `Browse ${SITE.name} supplement stacks with clear pricing and nutritional information.`
    : `Explore the ${SITE.name} performance range with transparent pricing, macros, amino profiles, and lab test reports.`;
  const catalogueSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: catalogueTitle,
    description: catalogueDescription,
    url: absoluteUrl("/products"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: totalItems,
      itemListElement: paginatedItems.map((item, index) => ({
        "@type": "ListItem",
        position: (currentPage - 1) * PAGE_SIZE + index + 1,
        name: item.name,
        url: absoluteUrl(catalogItemPath(item)),
      })),
    },
  };

  return (
    <>
      {!loading && <Seo title={catalogueTitle} description={catalogueDescription} canonicalPath="/products" indexable={!searchParams.toString()} structuredData={[catalogueSchema]} />}
      <section className="page-section bg-[#0A0A0C]">
      <div className="container-page">
        <div className="border border-slate-800 bg-[#121216] p-4 rounded-none sm:p-8 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-eyebrow">Legend Killer Vault</p>

              <h1 className="section-title mt-3">
                {bestSeller
                  ? "BEST SELLERS"
                  : featured
                    ? "FEATURED SUPPLEMENTS"
                    : selectedType === "combos"
                      ? "SUPPLEMENT STACKS"
                      : selectedType === "products"
                        ? "ALL SUPPLEMENTS"
                        : "ALL SUPPLEMENTS"}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Search, filter and compare high-performance protein, pre-workouts, and mass gainers.
              </p>
            </div>

            <form
              onSubmit={submitSearch}
              className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2 lg:max-w-md"
            >
              <div className="relative min-w-0">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products"
                  className="w-full py-3 pl-10 pr-10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <button type="submit" className="btn-primary px-5 py-3">
                Search
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:mt-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="touch-scroll -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 sm:pb-0">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600">
              <SlidersHorizontal size={16} />
            </span>

            {[
              ["all", "All"],
              ["products", "Products"],
              ["combos", "Combos"],
            ].map(([value, label]) => (
              <FilterButton
                key={value}
                active={selectedType === value}
                onClick={() =>
                  updateParams({
                    type: value,
                  })
                }
              >
                {label}
              </FilterButton>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((current) => !current)}
              className="btn-outline flex-1 lg:hidden"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>

            <label className="flex flex-1 items-center gap-2 text-sm text-slate-600 sm:flex-none">
              <span className="hidden shrink-0 font-medium sm:inline">
                Sort by
              </span>

              <select
                value={sort}
                onChange={(event) =>
                  updateParams({
                    sort: event.target.value,
                  })
                }
                className="min-w-0 flex-1 px-3 py-2.5 sm:min-w-[190px] sm:flex-none"
              >
                <option value="featured">Featured</option>

                <option value="newest">Newest</option>

                <option value="price-low">Price: low to high</option>

                <option value="price-high">Price: high to low</option>

                <option value="rating">Customer rating</option>

                <option value="name-az">Name: A to Z</option>
              </select>
            </label>
          </div>
        </div>

        <div
          className={`mt-4 border border-slate-200 bg-slate-50 p-4 ${
            filtersOpen ? "block" : "hidden"
          } lg:block`}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_auto] lg:items-end">
            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                Category
              </span>

              <select
                value={selectedCategory}
                onChange={(event) =>
                  updateParams({
                    category: event.target.value,
                  })
                }
                className="w-full px-3 py-2.5"
              >
                <option value="">All categories</option>

                {categories.map((category) => (
                  <option
                    key={category._id || category.slug}
                    value={category.slug}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                Price range
              </span>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={minimumPrice}
                  onChange={(event) => setMinimumPrice(event.target.value)}
                  placeholder="Min ₹"
                  className="w-full px-3 py-2.5"
                />

                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={maximumPrice}
                  onChange={(event) => setMaximumPrice(event.target.value)}
                  placeholder="Max ₹"
                  className="w-full px-3 py-2.5"
                />
              </div>
            </div>

            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                Availability
              </span>

              <select
                value={availability}
                onChange={(event) =>
                  updateParams({
                    availability: event.target.value,
                  })
                }
                className="w-full px-3 py-2.5"
              >
                <option value="all">All stock</option>

                <option value="in-stock">In stock</option>

                <option value="out-of-stock">Out of stock</option>
              </select>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={applyPriceFilters}
                className="btn-primary flex-1 whitespace-nowrap lg:flex-none"
              >
                Apply
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn-outline flex-1 whitespace-nowrap lg:flex-none"
                >
                  <RotateCcw size={15} />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        <div id="catalogue-results" className="scroll-mt-24">
          {!loading && !error && totalItems > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 text-sm text-slate-600">
              <p>
                Showing{" "}
                <strong className="text-slate-900">
                  {firstVisibleItem}–{lastVisibleItem}
                </strong>{" "}
                of <strong className="text-slate-900">{totalItems}</strong>{" "}
                items
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 font-semibold text-veda-leaf transition hover:text-veda-copper"
                >
                  <RotateCcw size={14} />
                  Clear filters
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="mt-7 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-5 lg:grid-cols-4">
              {Array.from({
                length: PAGE_SIZE,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse border border-slate-200 bg-slate-100 sm:h-80 sm:rounded-lg"
                />
              ))}
            </div>
          ) : error ? (
            <Alert type="error" className="mt-8">
              {error}
            </Alert>
          ) : totalItems === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="No matching products found"
                description="Try another category, price range or product name."
              />

              {hasActiveFilters && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="btn-outline"
                  >
                    <RotateCcw size={16} />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mt-7 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-5 lg:grid-cols-4">
                {paginatedItems.map((item) => (
                  <ProductCard
                    key={`${item.itemType || "item"}-${item._id || item.slug}`}
                    product={item}
                  />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={changePage}
              />
            </>
          )}
        </div>
      </div>
      </section>
    </>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition sm:text-sm ${
        active
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-950"
      }`}
    >
      {children}
    </button>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const paginationItems = createPaginationItems(currentPage, totalPages);

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 pt-6"
      aria-label="Product pages"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex h-10 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {paginationItems.map((item, index) => {
        if (typeof item === "string") {
          return (
            <span
              key={`${item}-${index}`}
              className="grid h-10 w-8 place-items-center text-sm text-slate-400"
            >
              …
            </span>
          );
        }

        return (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={currentPage === item ? "page" : undefined}
            className={`grid h-10 min-w-10 place-items-center rounded-md border px-3 text-sm font-semibold transition ${
              currentPage === item
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex h-10 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

async function fetchAllApiPages(requestFunction, params, signal) {
  const collectedItems = [];
  const seenItems = new Set();

  for (let page = 1; page <= MAX_API_PAGES; page += 1) {
    const response = await requestFunction(
      {
        ...removeEmptyValues(params),
        page,
        limit: API_FETCH_LIMIT,
      },
      {
        signal,
      },
    );

    const { items, pagination } = normalizeApiResponse(response);

    if (!items.length) {
      break;
    }

    let addedItems = 0;

    items.forEach((item, index) => {
      const uniqueKey =
        item?._id ||
        item?.id ||
        item?.slug ||
        `${page}-${index}-${item?.name || ""}`;

      if (!seenItems.has(String(uniqueKey))) {
        seenItems.add(String(uniqueKey));
        collectedItems.push(item);
        addedItems += 1;
      }
    });

    /*
     * This prevents an infinite loop if an API ignores
     * the page parameter and returns the same records.
     */
    if (addedItems === 0) {
      break;
    }

    const backendPages = Number(
      pagination?.pages ?? pagination?.totalPages ?? 0,
    );

    if (
      Number.isFinite(backendPages) &&
      backendPages > 0 &&
      page >= backendPages
    ) {
      break;
    }
  }

  return collectedItems;
}

function normalizeApiResponse(response) {
  if (Array.isArray(response)) {
    return {
      items: response,
      pagination: null,
    };
  }

  /*
   * Supports:
   * response.data = [...]
   * response = { data: [...], pagination: {...} }
   * Axios response = { data: { data: [...], pagination: {...} } }
   */
  const axiosPayload =
    response?.data &&
    !Array.isArray(response.data) &&
    (Array.isArray(response.data.data) || response.data.pagination)
      ? response.data
      : response;

  if (Array.isArray(axiosPayload)) {
    return {
      items: axiosPayload,
      pagination: null,
    };
  }

  const items = Array.isArray(axiosPayload?.data)
    ? axiosPayload.data
    : Array.isArray(axiosPayload?.items)
      ? axiosPayload.items
      : Array.isArray(axiosPayload?.products)
        ? axiosPayload.products
        : Array.isArray(axiosPayload?.combos)
          ? axiosPayload.combos
          : [];

  return {
    items,
    pagination: axiosPayload?.pagination || null,
  };
}

function removeEmptyValues(values) {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );
}

function createPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from(
      {
        length: totalPages,
      },
      (_, index) => index + 1,
    );
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "right-ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "left-ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "left-ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "right-ellipsis",
    totalPages,
  ];
}

function getItemPrice(item) {
  const value =
    item.salePrice ??
    item.discountedPrice ??
    item.price ??
    item.sellingPrice ??
    item.mrp ??
    0;

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function getItemRating(item) {
  const value = item.rating ?? item.averageRating ?? item.ratingsAverage ?? 0;

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function getItemCategorySlugs(item) {
  const categorySlugs = [];

  if (typeof item.category === "string") {
    categorySlugs.push(item.category);
  } else if (item.category?.slug) {
    categorySlugs.push(item.category.slug);
  }

  if (Array.isArray(item.categories)) {
    item.categories.forEach((category) => {
      if (typeof category === "string") {
        categorySlugs.push(category);
      } else if (category?.slug) {
        categorySlugs.push(category.slug);
      }
    });
  }

  return categorySlugs.filter(Boolean);
}

function isItemAvailable(item) {
  if (typeof item.inStock === "boolean") {
    return item.inStock;
  }

  if (typeof item.isInStock === "boolean") {
    return item.isInStock;
  }

  if (typeof item.available === "boolean") {
    return item.available;
  }

  const stockValue =
    item.stock ?? item.quantity ?? item.availableStock ?? item.inventory;

  if (stockValue !== undefined && stockValue !== null) {
    return Number(stockValue) > 0;
  }

  return true;
}

function sanitizePrice(value) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return "";
  }

  return String(Math.max(0, parsedValue));
}
