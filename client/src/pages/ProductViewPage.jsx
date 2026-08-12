import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Heart,
  Minus,
  PackageCheck,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import ProductCard from "../components/product/ProductCard";
import RecentlyViewed from "../components/home/RecentlyViewed";
import Seo, { absoluteUrl, breadcrumbSchema } from "../components/seo/Seo";
import Alert from "../components/ui/Alert";
import ProductImage from "../components/ui/ProductImage";
import { COMMERCE } from "../config/commerce";
import { SITE } from "../config/site";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { getErrorMessage, productApi } from "../services/api";
import { discountPercent, money } from "../utils/format";

const unwrapProduct = (response) =>
  response?.data?.data ||
  response?.data?.product ||
  response?.data ||
  response?.product ||
  response;

const unwrapProducts = (response) => {
  const value = response?.data?.data || response?.data || response;

  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.products)) return value.products;

  return [];
};

const hasValue = (value) =>
  value !== null && value !== undefined && String(value).trim() !== "";

const copyToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("Copy failed.");
  }
};

export default function ProductViewPage() {
  const { slug } = useParams();

  const { addToCart, openCart } = useCart();

  const { addRecentlyViewed, isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [mediaFilter, setMediaFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [shareStatus, setShareStatus] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadProduct = async () => {
      setLoading(true);
      setError("");
      setProduct(null);
      setRelatedProducts([]);
      setShareStatus(null);

      try {
        const response = await productApi.getProductBySlug(slug, {
          signal: controller.signal,
        });

        const item = unwrapProduct(response);

        if (!item?._id) {
          throw new Error("Product not found.");
        }

        if (!active) return;

        setProduct(item);
        setSelectedImage(item.images?.[0] || "");
        setQuantity(1);
        addRecentlyViewed(item);

        try {
          const relatedResponse = await productApi.getRelatedProducts(slug, {
            signal: controller.signal,
          });

          if (active) {
            setRelatedProducts(unwrapProducts(relatedResponse));
          }
        } catch {
          if (active) {
            setRelatedProducts([]);
          }
        }
      } catch (requestError) {
        if (
          active &&
          requestError?.name !== "AbortError" &&
          requestError?.name !== "CanceledError"
        ) {
          setError(
            getErrorMessage(requestError, "This product could not be loaded."),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      active = false;
      controller.abort();
    };
  }, [slug, addRecentlyViewed]);

  const galleryImages = useMemo(
    () =>
      Array.isArray(product?.images)
        ? product.images.filter(Boolean)
        : [],
    [product?.images],
  );

  useEffect(() => {
    if (galleryImages.length < 2) return undefined;

    const slideshow = window.setInterval(() => {
      setSelectedImage((currentImage) => {
        const currentIndex = galleryImages.indexOf(currentImage);
        const nextIndex = currentIndex < 0
          ? 0
          : (currentIndex + 1) % galleryImages.length;

        return galleryImages[nextIndex];
      });
    }, 3500);

    return () => window.clearInterval(slideshow);
  }, [galleryImages]);

  const visibleReviews = useMemo(() => {
    return (product?.reviews || [])
      .filter((review) => review.isApproved !== false)
      .filter((review) => {
        const ratingMatches =
          ratingFilter === "all" ||
          Number(review.rating) === Number(ratingFilter);

        const hasMedia = Array.isArray(review.media) && review.media.length > 0;

        const mediaMatches =
          mediaFilter === "all" ||
          (mediaFilter === "media" ? hasMedia : !hasMedia);

        return ratingMatches && mediaMatches;
      });
  }, [product, ratingFilter, mediaFilter]);

  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="h-[560px] animate-pulse rounded-[8px] bg-slate-100" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <section className="page-section">
        <Seo title={`Product Not Found | ${SITE.name}`} description="The requested product is not currently available." canonicalPath={`/products/${slug}`} indexable={false} structuredData={[]} />
        <div className="container-page max-w-2xl">
          <Alert type="error">{error || "Product not found."}</Alert>

          <Link to="/products" className="btn-outline mt-6">
            Back to products
          </Link>
        </div>
      </section>
    );
  }

  const images = galleryImages;

  const hasDiscount = Number(product.mrp || 0) > Number(product.price || 0);

  const stockValue = product.availableStock ?? product.stock ?? null;

  const stockKnown =
    product.stockKnown === true ||
    product.availableStock !== undefined ||
    product.stock !== undefined;

  const availableStock = stockKnown
    ? Math.max(0, Number(stockValue || 0))
    : null;

  const outOfStock =
    product.isActive === false || (stockKnown && availableStock <= 0);

  const lowStock =
    !outOfStock &&
    stockKnown &&
    availableStock <= Number(product.lowStockThreshold || 5);

  const maxQuantity =
    stockKnown && availableStock > 0
      ? Math.min(availableStock, COMMERCE.maxItemQuantity)
      : COMMERCE.maxItemQuantity;

  const wishlisted = isWishlisted(product);

  const inventoryText = outOfStock
    ? "Currently unavailable"
    : lowStock
      ? `Only ${availableStock} left`
      : "In stock";

  const updateQuantity = (nextValue) => {
    const parsedValue = Number(nextValue || 1);

    const safeValue = Math.min(
      COMMERCE.maxItemQuantity,
      Math.max(1, Math.floor(parsedValue)),
    );

    setQuantity(maxQuantity ? Math.min(safeValue, maxQuantity) : safeValue);
  };

  const handleAddToCart = () => {
    if (outOfStock) return;

    addToCart(product, quantity);
    openCart();
  };

  const handleShareProduct = async () => {
    const shareUrl = window.location.href;

    const shareData = {
      title: product.seoTitle || product.name,
      text:
        product.shortDescription || `Check out ${product.name} on Legend Killer.`,
      url: shareUrl,
    };

    setShareStatus(null);

    try {
      if (navigator.share) {
        await navigator.share(shareData);

        setShareStatus({
          type: "success",
          message: "Product shared successfully.",
        });
      } else {
        await copyToClipboard(shareUrl);

        setShareStatus({
          type: "success",
          message: "Product link copied.",
        });
      }
    } catch (shareError) {
      if (shareError?.name === "AbortError") {
        return;
      }

      try {
        await copyToClipboard(shareUrl);

        setShareStatus({
          type: "success",
          message: "Product link copied.",
        });
      } catch {
        setShareStatus({
          type: "error",
          message: "Unable to share this product.",
        });
      }
    }

    window.setTimeout(() => {
      setShareStatus(null);
    }, 3000);
  };

  const productSpecifications = [
    {
      label: "Category",
      value: product.category?.name,
    },
    {
      label: "Pack size",
      value: product.weight,
    },
    {
      label: "Pack type",
      value: product.unit,
    },
    {
      label: "SKU",
      value: product.sku,
    },
    {
      label: "Country of origin",
      value: product.countryOfOrigin,
    },
    {
      label: "Marketed by",
      value: product.marketerName,
    },
    {
      label: "Manufactured by",
      value: product.manufacturerName,
    },
    {
      label: "HSN code",
      value: product.hsnCode,
    },
    {
      label: "Licence type",
      value: product.licenceType,
    },
    {
      label: "Licence number",
      value: product.licenceNumber,
    },
    {
      label: "Vegetarian",
      value:
        product.vegetarian === true
          ? "Yes"
          : product.vegetarian === false
            ? "No"
            : null,
    },
  ].filter((item) => hasValue(item.value));

  const canonicalPath = `/products/${product.slug}`;
  const seoDescription = String(
    product.seoDescription || product.shortDescription || product.description ||
      `View ${product.name}, pack information, price and responsible-use details.`,
  ).replace(/\s+/g, " ").trim().slice(0, 180);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: seoDescription,
    image: images,
    url: absoluteUrl(canonicalPath),
    brand: { "@type": "Brand", name: product.brand || SITE.name },
    category: product.category?.name,
    sku: product.sku || undefined,
    mpn: product.sku || undefined,
    weight: product.weight || undefined,
    countryOfOrigin: product.countryOfOrigin
      ? { "@type": "Country", name: product.countryOfOrigin }
      : undefined,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(canonicalPath),
      priceCurrency: SITE.currency,
      price: Number(product.price || 0),
      availability: outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE.url}/#organization` },
    },
  };
  if (Number(product.numReviews || visibleReviews.length) > 0 && Number(product.rating || 0) > 0) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(product.rating),
      reviewCount: Number(product.numReviews || visibleReviews.length),
      bestRating: 5,
      worstRating: 1,
    };
    productSchema.review = visibleReviews.slice(0, 5).map((review) => ({
      "@type": "Review",
      author: { "@type": "Person", name: review.name },
      datePublished: review.createdAt,
      reviewBody: review.comment,
      reviewRating: { "@type": "Rating", ratingValue: Number(review.rating), bestRating: 5, worstRating: 1 },
    }));
  }

  return (
    <section className="page-section pb-28 lg:pb-24">
      <Seo
        title={product.seoTitle || `${product.name} | ${SITE.name}`}
        description={seoDescription}
        canonicalPath={canonicalPath}
        image={images[0] || SITE.ogImagePath}
        imageAlt={product.name}
        type="product"
        indexable
        structuredData={[
          productSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            ...(product.category?.slug ? [{ name: product.category.name, path: `/categories/${product.category.slug}` }] : []),
            { name: product.name, path: canonicalPath },
          ]),
        ]}
      />
      <div className="container-page grid gap-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 overflow-hidden text-xs text-slate-500 lg:col-span-2">
          <Link to="/" className="shrink-0 hover:text-slate-950">Home</Link><span aria-hidden="true">/</span>
          <Link to="/products" className="shrink-0 hover:text-slate-950">Products</Link><span aria-hidden="true">/</span>
          {product.category?.slug && <><Link to={`/categories/${product.category.slug}`} className="shrink-0 hover:text-slate-950">{product.category.name}</Link><span aria-hidden="true">/</span></>}
          <span className="truncate text-slate-700" aria-current="page">{product.name}</span>
        </nav>
        <div className="lg:sticky lg:top-28">
          <div className="overflow-hidden border border-slate-200 bg-slate-100 shadow-sm sm:rounded-[8px]">
            <ProductImage
              key={selectedImage || images[0]}
              src={selectedImage || images[0]}
              alt={product.name}
              className="aspect-square h-auto w-full object-contain sm:h-[580px] sm:aspect-auto"
              fallbackClassName="aspect-square h-auto w-full sm:h-[580px] sm:aspect-auto"
              loading="eager"
            />
          </div>

          {images.length > 1 && (
            <div className="touch-scroll -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mt-4 sm:grid sm:grid-cols-5 sm:gap-3 sm:px-0">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`w-20 shrink-0 overflow-hidden rounded-[4px] border bg-slate-100 sm:w-auto sm:rounded-[6px] ${
                    selectedImage === image
                      ? "border-slate-950 ring-2 ring-slate-200"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                  aria-label={`View ${product.name} image ${index + 1}`}
                >
                  <ProductImage
                    src={image}
                    alt=""
                    className="h-20 w-20 object-contain sm:h-24 sm:w-full"
                    fallbackClassName="h-20 w-20 sm:h-24 sm:w-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <p className="section-eyebrow">
              {product.category?.name || "Legend Killer"}
            </p>

            <button
              type="button"
              onClick={handleShareProduct}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
              aria-label="Share this product"
            >
              <Share2 size={17} />
              Share
            </button>
          </div>

          <h1 className="mt-3 break-words !font-sans text-[1.4rem] font-semibold leading-[1.25] tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">{product.name}</h1>

          {shareStatus && (
            <p
              className={`mt-3 text-sm font-medium ${
                shareStatus.type === "success"
                  ? "text-emerald-700"
                  : "text-red-600"
              }`}
              role="status"
              aria-live="polite"
            >
              {shareStatus.message}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs sm:mt-5 sm:gap-3 sm:text-sm">
            {Number(product.numReviews || 0) > 0 ? (
              <>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-3 py-1.5 font-semibold text-white">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {Number(product.rating || 0).toFixed(1)}
                </span>

                <span className="text-slate-500">
                  {product.numReviews || product.reviews?.length || 0} reviews
                </span>

                <span className="h-1 w-1 rounded-full bg-slate-300" />
              </>
            ) : (
              <>
                <span className="text-slate-500">No reviews yet</span>

                <span className="h-1 w-1 rounded-full bg-slate-300" />
              </>
            )}

            <span
              className={`font-semibold ${
                outOfStock
                  ? "text-red-600"
                  : lowStock
                    ? "text-amber-700"
                    : "text-emerald-700"
              }`}
            >
              {inventoryText}
            </span>
          </div>

          <div className="mt-5 border-y border-slate-200 py-5 sm:mt-6 sm:py-6">
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-3xl font-semibold text-slate-950 sm:text-4xl">
                {money(product.price)}
              </span>

              {hasDiscount && (
                <>
                  <span className="pb-1 text-lg text-slate-500 line-through">
                    {money(product.mrp)}
                  </span>

                  <span className="mb-1 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">
                    {discountPercent(product.mrp, product.price)}% off
                  </span>
                </>
              )}
            </div>

            {hasDiscount && (
              <p className="mt-2 text-sm font-semibold text-emerald-700">
                You save {money(Number(product.mrp) - Number(product.price))}
              </p>
            )}

            <p className="mt-2 text-sm text-slate-500">
              Inclusive of applicable taxes. Shipping is calculated at checkout.
            </p>

            {product.weight && (
              <p className="mt-1 text-sm text-slate-500">
                Pack size: {product.weight}
                {product.unit ? ` · ${product.unit}` : ""}
              </p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-[auto_minmax(0,1fr)] gap-3 sm:mt-7 sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <div className="inline-flex h-12 w-fit items-center rounded-[4px] border border-slate-300 bg-white">
              <button
                type="button"
                onClick={() => updateQuantity(quantity - 1)}
                disabled={outOfStock || quantity <= 1}
                className="grid h-12 w-12 place-items-center rounded-l-lg hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>

              <input
                type="number"
                min="1"
                max={maxQuantity}
                disabled={outOfStock}
                value={quantity}
                onChange={(event) => updateQuantity(event.target.value)}
                className="h-12 w-16 rounded-none border-y-0 text-center font-semibold shadow-none focus:ring-0"
                aria-label="Quantity"
              />

              <button
                type="button"
                onClick={() => updateQuantity(quantity + 1)}
                disabled={outOfStock || quantity >= maxQuantity}
                className="grid h-12 w-12 place-items-center rounded-r-lg hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="btn-primary h-12 w-full min-w-0 px-4 sm:w-auto sm:px-8"
            >
              <ShoppingBag size={18} />
              {outOfStock ? "Unavailable" : "Add to cart"}
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className="btn-outline h-12 w-full min-w-0 px-4 sm:w-auto sm:px-5"
              aria-pressed={wishlisted}
            >
              <Heart
                size={18}
                className={wishlisted ? "fill-current text-red-600" : ""}
              />
              {wishlisted ? "Saved" : "Save"}
            </button>

            <button
              type="button"
              onClick={handleShareProduct}
              className="btn-outline h-12 w-full min-w-0 px-4 sm:w-auto sm:px-5"
              aria-label="Share this product"
            >
              <Share2 size={18} />
              Share
            </button>
          </div>

          <div className="mt-7 hidden gap-2.5 sm:mt-8 sm:grid-cols-3 sm:gap-3 lg:grid">
            <TrustBox
              icon={ShieldCheck}
              title="Product information"
              description="Ingredients and usage details provided"
            />

            <TrustBox
              icon={Truck}
              title="Delivery support"
              description="Track shipping from your account"
            />

            <TrustBox
              icon={PackageCheck}
              title="Secure ordering"
              description="Stock and totals verified at checkout"
            />
          </div>

          <div className="hidden lg:block">
            <KeyBenefits benefits={product.benefits} />
          </div>
        </div>
      </div>

      <div className="container-page mt-10 sm:mt-16">
        <div className="border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[8px] sm:p-8">
          <p className="section-eyebrow">Product details</p>

          <ProductDescriptionMedia product={product} />

          <section className="mt-6 border-t border-slate-200 pt-6 lg:mt-10 lg:pt-8">
            <h2 className="hidden text-[1.75rem] font-semibold text-slate-950 lg:block lg:text-3xl">
              About this product
            </h2>

            <div className="mt-5 hidden space-y-4 text-base leading-8 text-slate-600 lg:block">
              {product.longDescription && (
                <p className="whitespace-pre-line">{product.longDescription}</p>
              )}

              {product.description &&
                product.description !== product.longDescription && (
                  <p className="whitespace-pre-line">{product.description}</p>
              )}
            </div>

            <div className="lg:hidden">
              <MobileAccordion title="About this product">
                <div className="space-y-4 text-[15px] leading-7 text-slate-600">
                  {product.longDescription && <p className="whitespace-pre-line">{product.longDescription}</p>}
                  {product.description && product.description !== product.longDescription && <p className="whitespace-pre-line">{product.description}</p>}
                </div>
              </MobileAccordion>
            </div>
          </section>

          <ProductSpecifications items={productSpecifications} />

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Info title="Ingredients" items={product.ingredients} />

            <Info title="How to use" text={product.howToUse} />

            <Info title="Suitable for" items={product.suitableFor} />

            <Info
              title="Storage instructions"
              text={product.storageInstructions}
            />

            <Info title="Warnings" items={product.warnings} warning />

            <Info
              title="Legal disclaimer"
              text={product.legalDisclaimer}
              warning
            />
          </div>

          <div className="mt-8 space-y-6 border-t border-slate-200 pt-8 lg:hidden">
            <div className="grid gap-3 sm:grid-cols-3">
              <TrustBox
                icon={ShieldCheck}
                title="Product information"
                description="Ingredients and usage details provided"
              />
              <TrustBox
                icon={Truck}
                title="Delivery support"
                description="Track shipping from your account"
              />
              <TrustBox
                icon={PackageCheck}
                title="Secure ordering"
                description="Stock and totals verified at checkout"
              />
            </div>
            <KeyBenefits benefits={product.benefits} compact />
          </div>
        </div>
      </div>

      <div className="container-page mt-10 sm:mt-16">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-eyebrow">Customer feedback</p>

            <h2 className="mt-3 text-[1.75rem] font-semibold text-slate-950 sm:text-3xl">
              Reviews
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {product.numReviews || product.reviews?.length || 0} customer
              reviews
            </p>
          </div>

          {(product.reviews || []).length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={ratingFilter}
                onChange={(event) => setRatingFilter(event.target.value)}
                className="px-4 py-3 text-sm"
              >
                <option value="all">All ratings</option>

                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} stars
                  </option>
                ))}
              </select>

              <select
                value={mediaFilter}
                onChange={(event) => setMediaFilter(event.target.value)}
                className="px-4 py-3 text-sm"
              >
                <option value="all">All reviews</option>
                <option value="media">With media</option>
                <option value="text">Text only</option>
              </select>
            </div>
          )}
        </div>

        {(product.reviews || []).length === 0 ? (
          <div className="mt-7 rounded-[8px] border border-slate-200 bg-slate-50 p-8 text-center">
            <Star size={28} className="mx-auto text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-950">
              No reviews yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Customer reviews will appear here.
            </p>
          </div>
        ) : visibleReviews.length ? (
          <div className="mt-6 grid gap-4 sm:mt-7 sm:gap-5 md:grid-cols-2">
            {visibleReviews.map((review, index) => (
              <ReviewCard key={review._id || index} review={review} />
            ))}
          </div>
        ) : (
          <div className="mt-7 rounded-[8px] border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
            No reviews match the selected filters.
          </div>
        )}
      </div>

      <RecentlyViewed excludeId={product._id} />

      {relatedProducts.length > 0 && (
        <div className="container-page mt-10 sm:mt-16">
          <p className="section-eyebrow">Continue browsing</p>

          <h2 className="mt-3 text-[1.75rem] font-semibold text-slate-950 sm:text-3xl">
            Related products
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-7 sm:gap-5 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </div>
      )}

      <div className="mobile-safe-bottom fixed inset-x-0 bottom-[calc(4.45rem+env(safe-area-inset-bottom))] z-40 border-t border-slate-200 bg-white/95 px-4 pt-3 shadow-[0_-8px_24px_rgba(41,45,38,0.12)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] text-slate-500">
              {product.name}
            </p>

            <p className="text-lg font-bold text-slate-950">
              {money(product.price)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleShareProduct}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-700"
            aria-label="Share this product"
          >
            <Share2 size={18} />
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="btn-primary min-w-[135px] px-4"
          >
            <ShoppingBag size={17} />
            {outOfStock ? "Unavailable" : "Add to cart"}
          </button>
        </div>
      </div>
    </section>
  );
}

function TrustBox({ icon: Icon, title, description }) {
  return (
    <div className="rounded-[6px] border border-slate-200 bg-white p-4">
      <Icon size={19} className="text-slate-700" />

      <h3 className="mt-3 text-sm font-semibold text-slate-950">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function MobileAccordion({ title, children, warning = false, defaultOpen = false }) {
  return (
    <details open={defaultOpen} className={`group overflow-hidden border ${warning ? "border-amber-200 bg-amber-50/60" : "border-slate-200 bg-white"}`}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-left [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2 font-semibold text-slate-950">
          {warning && <AlertTriangle size={17} className="shrink-0 text-amber-700" />}
          {title}
        </span>
        <ChevronDown size={18} className={`shrink-0 transition-transform group-open:rotate-180 ${warning ? "text-amber-700" : "text-slate-500"}`} />
      </summary>
      <div className={`border-t px-4 py-4 ${warning ? "border-amber-200" : "border-slate-200"}`}>
        {children}
      </div>
    </details>
  );
}

function ProductSpecifications({ items }) {
  if (!items.length) return null;

  const content = (
    <dl className="divide-y divide-slate-200">
      {items.map(({ label, value }) => (
        <div key={label} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6 sm:px-5">
          <dt className="font-medium text-slate-500">{label}</dt>
          <dd className="font-semibold text-slate-900">{value}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <>
      <div className="mt-4 lg:hidden">
        <MobileAccordion title="Product specifications">
          <div className="-mx-4 -my-4">{content}</div>
        </MobileAccordion>
      </div>
      <div className="mt-8 hidden lg:block">
        <h3 className="text-lg font-semibold text-slate-950">Product specifications</h3>
        <div className="mt-4 overflow-hidden rounded-[8px] border border-slate-200">{content}</div>
      </div>
    </>
  );
}

function KeyBenefits({ benefits, compact = false }) {
  if (!Array.isArray(benefits) || benefits.length === 0) return null;

  const list = (
    <ul className="grid gap-3 sm:grid-cols-2">
        {benefits.map((item, index) => (
          <li
            key={item}
            className="group relative flex min-h-28 gap-3 overflow-hidden border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700 transition hover:border-veda-gold hover:shadow-card"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={17} />
            </span>
            <span className="pt-1 font-medium">{item}</span>
            <span className="absolute bottom-1 right-3 font-display text-4xl text-slate-100 transition group-hover:text-amber-100" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          </li>
        ))}
    </ul>
  );

  if (compact) {
    return <MobileAccordion title="Key benefits">{list}</MobileAccordion>;
  }

  return (
    <div className="mt-7 border border-slate-200 bg-slate-50 p-4 sm:mt-8 sm:rounded-[8px] sm:p-5">
      <h2 className="text-lg font-semibold text-slate-950">Key benefits</h2>
      <div className="mt-4">{list}</div>
    </div>
  );
}

function ProductDescriptionMedia({ product }) {
  const infographics = Array.isArray(product.infographics) ? product.infographics.filter((item) => item?.url) : [];
  const videos = Array.isArray(product.videos) ? product.videos.filter((item) => item?.url) : [];

  if (!infographics.length && !videos.length) return null;

  return (
    <section className="mt-6 border-t border-slate-200 pt-6 lg:mt-10 lg:pt-8" aria-labelledby="product-visual-guide">
      <p className="section-eyebrow">Visual product guide</p>
      <h3 id="product-visual-guide" className="mt-3 text-xl font-semibold text-slate-950 sm:text-2xl lg:text-3xl">Videos & infographics</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Review the visual information supplied for this pack. Always follow the final label and professional advice where applicable.</p>

      {videos.length > 0 && (
        <div className="mt-5 grid gap-5 lg:mt-6 lg:grid-cols-2">
          {videos.map((item, index) => (
            <figure key={`${item.url}-${index}`} className="overflow-hidden border border-slate-200 bg-slate-950">
              <ProductVideo
                item={item}
                title={item.title || `${product.name} product video ${index + 1}`}
              />
              {(item.title || item.caption) && (
                <figcaption className="border-t border-white/10 bg-slate-950 px-4 py-4 text-white">
                  {item.title && <span className="block text-sm font-semibold">{item.title}</span>}
                  {item.caption && <span className="mt-1 block text-xs leading-5 text-slate-300">{item.caption}</span>}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {infographics.length > 0 && (
        <div className={`${videos.length ? "mt-5 lg:mt-8" : "mt-5 lg:mt-6"} grid gap-5 lg:grid-cols-2`}>
          {infographics.map((item, index) => (
            <figure key={`${item.url}-${index}`} className="overflow-hidden border border-slate-200 bg-slate-50">
              <ProductImage
                src={item.url}
                alt={item.altText || `${product.name} infographic ${index + 1}`}
                className="h-auto w-full object-contain"
                fallbackClassName="min-h-72 w-full"
              />
              {item.caption && <figcaption className="border-t border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">{item.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}

function ProductVideo({ item, title }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  const toggleMuted = () => {
    const nextMuted = !muted;
    if (videoRef.current) videoRef.current.muted = nextMuted;
    setMuted(nextMuted);
  };

  return (
    <div className="relative bg-black">
      <video
        ref={videoRef}
        src={item.url}
        autoPlay
        loop
        muted={muted}
        playsInline
        preload="metadata"
        disablePictureInPicture
        className="aspect-video w-full bg-black object-contain"
        aria-label={title}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/70 to-transparent p-3 pt-10">
        <button
          type="button"
          onClick={toggleMuted}
          className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
          aria-label={muted ? "Unmute product video" : "Mute product video"}
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </div>
  );
}

function Info({ title, items, text, warning = false }) {
  const values = Array.isArray(items) ? items.filter(Boolean) : [];

  if (!values.length && !hasValue(text)) {
    return null;
  }

  const content = (
    <>
      {values.length ? (
        <ul className="space-y-2 text-sm leading-6 text-slate-600">
          {values.map((item) => (
            <li key={item} className="flex gap-2">
              <span className={warning ? "text-amber-700" : "text-emerald-700"}>
                •
              </span>

              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
          {text}
        </p>
      )}
    </>
  );

  return (
    <>
      <div className="lg:hidden">
        <MobileAccordion title={title} warning={warning}>{content}</MobileAccordion>
      </div>
      <div className={`hidden rounded-[6px] border p-5 lg:block ${warning ? "border-amber-200 bg-amber-50/60" : "border-slate-200 bg-slate-50"}`}>
        <div className="flex items-center gap-2">
          {warning && <AlertTriangle size={17} className="shrink-0 text-amber-700" />}
          <h3 className="font-semibold text-slate-950">{title}</h3>
        </div>
        <div className="mt-3">{content}</div>
      </div>
    </>
  );
}

function ReviewCard({ review }) {
  const rating = Math.max(0, Math.min(5, Number(review.rating || 0)));

  return (
    <article className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-950">
            {review.name || "Customer"}
          </h3>

          {review.isVerifiedPurchase && (
            <p className="mt-1 text-xs font-semibold text-emerald-700">
              Verified purchase
            </p>
          )}
        </div>

        <div className="flex gap-0.5 text-amber-600">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={15}
              className={index < rating ? "fill-current" : "text-slate-200"}
            />
          ))}
        </div>
      </div>

      {review.title && (
        <p className="mt-4 font-semibold text-slate-900">{review.title}</p>
      )}

      <p className="mt-2 text-sm leading-7 text-slate-600">{review.comment}</p>

      {Array.isArray(review.media) && review.media.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {review.media.map((media, index) =>
            media.type === "video" ? (
              <video
                key={media.url || index}
                src={media.url}
                controls
                className="h-40 w-full rounded-[6px] object-cover"
              />
            ) : (
              <ProductImage
                key={media.url || index}
                src={media.url}
                alt="Customer review"
                className="h-40 w-full rounded-[6px] object-cover"
                fallbackClassName="h-40 w-full rounded-[6px]"
              />
            ),
          )}
        </div>
      )}
    </article>
  );
}
