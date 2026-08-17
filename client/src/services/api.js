import { clearStoredSession, getStoredToken } from "../utils/storage";
import { getCatalogType } from "../utils/catalog";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://api.legendbornnutrition.com/api").replace(/\/$/, "");
export const STATIC_BASE_URL = (import.meta.env.VITE_ASSET_BASE_URL || API_BASE_URL.replace(/\/api(?:\/v\d+)?\/?$/, "")).replace(/\/$/, "");
const COIN_API_PATH = (import.meta.env.VITE_COIN_API_PATH || "/amyeka-coins").replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = Math.max(3000, Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000));

export const unwrapData = (value) => {
  let current = value;
  for (let index = 0; index < 3; index += 1) {
    if (current && typeof current === "object" && "data" in current && current.data !== undefined) {
      current = current.data;
    } else {
      break;
    }
  }
  return current;
};

const extractArray = (value) => {
  const unwrapped = unwrapData(value);
  if (Array.isArray(unwrapped)) return unwrapped;
  if (Array.isArray(unwrapped?.items)) return unwrapped.items;
  if (Array.isArray(unwrapped?.products)) return unwrapped.products;
  if (Array.isArray(unwrapped?.orders)) return unwrapped.orders;
  if (Array.isArray(unwrapped?.categories)) return unwrapped.categories;
  if (Array.isArray(unwrapped?.combos)) return unwrapped.combos;
  if (Array.isArray(unwrapped?.testimonials)) return unwrapped.testimonials;
  if (Array.isArray(unwrapped?.banners)) return unwrapped.banners;
  if (Array.isArray(unwrapped?.results)) return unwrapped.results;
  if (Array.isArray(unwrapped?.docs)) return unwrapped.docs;
  return [];
};

export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  const candidates = [
    error?.response?.data,
    error?.response,
    error?.data,
    error,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    if (!candidate || typeof candidate !== "object") continue;
    const message = candidate.message || candidate.error || candidate.detail;
    if (typeof message === "string" && message.trim()) return message.trim();
  }
  return fallback;
};

export const imageUrl = (url) => {
  if (!url) return "";
  const value = String(url);
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  return `${STATIC_BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
};

const normalizeReview = (review = {}) => ({
  ...review,
  media: Array.isArray(review.media)
    ? review.media.map((media) => ({ ...media, url: imageUrl(media.url) }))
    : [],
});

const normalizeInfographic = (item) => {
  const value = typeof item === "string" ? { url: item } : item || {};
  return { ...value, url: imageUrl(value.url) };
};

const normalizeProductVideo = (item) => {
  const value = typeof item === "string" ? { url: item } : item || {};
  return { ...value, url: imageUrl(value.url) };
};

export const normalizeProduct = (product = {}) => ({
  ...product,
  itemType: "PRODUCT",
  catalogType: getCatalogType(product),
  price: Number(product.price || 0),
  mrp: Number(product.mrp || 0),
  stockKnown: product.availableStock != null || product.stock != null,
  availableStock: Number(product.availableStock ?? product.stock ?? 0),
  images: Array.isArray(product.images) ? product.images.map(imageUrl).filter(Boolean) : [],
  infographics: Array.isArray(product.infographics)
    ? product.infographics.map(normalizeInfographic).filter((item) => item.url)
    : [],
  videos: Array.isArray(product.videos)
    ? product.videos.map(normalizeProductVideo).filter((item) => item.url)
    : [],
  reviews: Array.isArray(product.reviews) ? product.reviews.map(normalizeReview) : [],
  category: product.category || null,
  rating: Number(product.rating || 0),
  numReviews: Number(product.numReviews || 0),
});

export const normalizeCombo = (combo = {}) => {
  const productImages = Array.isArray(combo.products)
    ? combo.products.flatMap((item) => item?.product?.images || [])
    : [];
  return {
    ...combo,
    itemType: "COMBO",
    catalogType: "combo",
    price: Number(combo.price || 0),
    mrp: Number(combo.mrp || 0),
    stockKnown: combo.availableStock != null || combo.stock != null,
    availableStock: Number(combo.availableStock ?? combo.stock ?? 0),
    category: combo.category || { name: "Combo", slug: "combos" },
    images: (Array.isArray(combo.images) && combo.images.length ? combo.images : productImages.slice(0, 1))
      .map(imageUrl)
      .filter(Boolean),
    rating: Number(combo.rating || 0),
    numReviews: Number(combo.numReviews || 0),
  };
};

const createCombinedSignal = (externalSignal, timeoutController) => {
  if (!externalSignal) return { signal: timeoutController.signal, cleanup: () => {} };
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.any === "function") {
    return { signal: AbortSignal.any([externalSignal, timeoutController.signal]), cleanup: () => {} };
  }

  const handleExternalAbort = () => timeoutController.abort(externalSignal.reason);
  if (externalSignal.aborted) handleExternalAbort();
  else externalSignal.addEventListener("abort", handleExternalAbort, { once: true });

  return {
    signal: timeoutController.signal,
    cleanup: () => externalSignal.removeEventListener("abort", handleExternalAbort),
  };
};

const request = async (path, options = {}) => {
  const {
    auth = "optional",
    signal: externalSignal,
    headers: customHeaders,
    body,
    ...fetchOptions
  } = options;

  const headers = { Accept: "application/json", ...(customHeaders || {}) };
  if (body && !(body instanceof FormData)) headers["Content-Type"] = "application/json";

  const authToken = getStoredToken();
  if (auth !== "none" && authToken) headers.Authorization = `Bearer ${authToken}`;
  if (auth === "required" && !authToken) {
    const error = new Error("Please log in to continue.");
    error.code = "AUTH_REQUIRED";
    error.status = 401;
    throw error;
  }

  const timeoutController = new AbortController();
  const { signal, cleanup: cleanupSignal } = createCombinedSignal(externalSignal, timeoutController);
  const timeoutId = window.setTimeout(() => timeoutController.abort("timeout"), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      body,
      headers,
      signal,
    });

    const contentType = response.headers.get("content-type") || "";
    let payload = {};
    if (response.status !== 204) {
      if (contentType.includes("application/json")) payload = await response.json().catch(() => ({}));
      else payload = { message: await response.text().catch(() => "") };
    }

    if (response.status === 401 && auth === "required") {
      clearStoredSession();
      window.dispatchEvent(new CustomEvent("ameyka:unauthorized"));
    }

    if (!response.ok) {
      const error = new Error(payload?.message || `Request failed (${response.status}).`);
      error.response = payload;
      error.status = response.status;
      throw error;
    }

    return payload;
  } catch (error) {
    if (error?.name === "AbortError" || timeoutController.signal.aborted) {
      if (externalSignal?.aborted) throw error;
      const timeoutError = new Error("The request timed out. Please check your connection and try again.");
      timeoutError.code = "REQUEST_TIMEOUT";
      throw timeoutError;
    }
    if (error instanceof TypeError) {
      const networkError = new Error("Unable to connect to the server. Please check your internet connection.");
      networkError.code = "NETWORK_ERROR";
      throw networkError;
    }
    throw error;
  } finally {
    cleanupSignal();
    window.clearTimeout(timeoutId);
  }
};

const jsonBody = (payload) => JSON.stringify(payload);

export const productApi = {
  getProducts: async (params = {}, options = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    const response = await request(`/products${query ? `?${query}` : ""}`, { ...options, auth: "none" });
    return extractArray(response).map(normalizeProduct);
  },
  getProductBySlug: async (slug, options = {}) =>
    normalizeProduct(unwrapData(await request(`/products/${encodeURIComponent(slug)}`, { ...options, auth: "none" }))),
  verifyByCode: async (code, options = {}) =>
    request(`/products/verify/${encodeURIComponent(code)}`, { ...options, auth: "none" }),
  getRelatedProducts: async (slug, options = {}) =>
    extractArray(await request(`/products/${encodeURIComponent(slug)}/related`, { ...options, auth: "none" })).map(normalizeProduct),
  addReview: async (slug, payload) =>
    request(`/products/${encodeURIComponent(slug)}/reviews`, {
      method: "POST",
      auth: "required",
      body: payload instanceof FormData ? payload : jsonBody(payload),
    }),
};

export const comboApi = {
  getCombos: async (params = {}, options = {}) => {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== "" && value != null)).toString();
    return extractArray(await request(`/combos${query ? `?${query}` : ""}`, { ...options, auth: "none" })).map(normalizeCombo);
  },
  getComboBySlug: async (slug, options = {}) =>
    normalizeCombo(unwrapData(await request(`/combos/${encodeURIComponent(slug)}`, { ...options, auth: "none" }))),
};

export const categoryApi = {
  getCategories: async (options = {}) =>
    extractArray(await request("/categories", { ...options, auth: "none" }))
      .filter((category) => category?.isActive !== false)
      .map((category) => ({ ...category, image: imageUrl(category.image) })),
};

export const bannerApi = {
  getBanners: async (page, options = {}) =>
    extractArray(await request(`/banners?page=${encodeURIComponent(page)}`, { ...options, auth: "none" }))
      .filter((banner) => banner?.isActive !== false)
      .map((banner) => ({ ...banner, image: imageUrl(banner.image), mobileImage: imageUrl(banner.mobileImage) })),
};

export const testimonialApi = {
  getTestimonials: async (options = {}) =>
    extractArray(await request("/testimonials", { ...options, auth: "none" })).map((item) => ({
      ...item,
      image: imageUrl(item.image),
    })),
};

export const articleApi = {
  getArticles: async (options = {}) =>
    extractArray(await request("/blogs", { ...options, auth: "none" })).map((item) => ({
      ...item,
      coverImage: imageUrl(item.coverImage),
    })),
  getArticleBySlug: async (slug, options = {}) => {
    const item = unwrapData(
      await request(`/blogs/${encodeURIComponent(slug)}`, { ...options, auth: "none" }),
    );
    return item ? { ...item, coverImage: imageUrl(item.coverImage) } : null;
  },
};

export const authApi = {
  login: (payload) => request("/auth/login", { method: "POST", auth: "none", body: jsonBody(payload) }),
  register: (payload) => request("/auth/register", { method: "POST", auth: "none", body: jsonBody(payload) }),
  requestOtp: (payload) => request("/auth/request-otp", { method: "POST", auth: "none", body: jsonBody(payload) }),
  loginWithOtp: (payload) => request("/auth/login-otp", { method: "POST", auth: "none", body: jsonBody(payload) }),
  getProfile: () => request("/auth/profile", { auth: "required" }),
  forgotPassword: (payload) => request("/auth/forgot-password", { method: "POST", auth: "none", body: jsonBody(payload) }),
  resetPassword: (payload) => request("/auth/reset-password", { method: "POST", auth: "none", body: jsonBody(payload) }),
};

export const coinApi = {
  getMyWallet: () => request(`${COIN_API_PATH}/wallet`, { auth: "required" }),
  getSetting: () => request(`${COIN_API_PATH}/setting`, { auth: "required" }),
};

export const contactApi = {
  sendMessage: (payload) => request("/contact", { method: "POST", auth: "none", body: jsonBody(payload) }),
};

export const orderApi = {
  createOrder: (payload) => request("/orders", { method: "POST", auth: "required", body: jsonBody(payload) }),
  createGuestOrder: (payload) => request("/orders/guest", { method: "POST", auth: "none", body: jsonBody(payload) }),
  verifyRazorpayPayment: (payload) =>
    request("/orders/razorpay/verify", {
      method: "POST",
      auth: getStoredToken() ? "optional" : "none",
      body: jsonBody(payload),
    }),
  myOrders: async () => extractArray(await request("/orders/my-orders", { auth: "required" })),
  getOrderById: async (orderId) => unwrapData(await request(`/orders/${encodeURIComponent(orderId)}`, { auth: "required" })),
  trackGuestOrder: async (payload) => unwrapData(await request("/orders/track", { method: "POST", auth: "none", body: jsonBody(payload) })),
  retryPayment: async (orderId) => unwrapData(await request(`/orders/${encodeURIComponent(orderId)}/retry-payment`, { method: "POST", auth: getStoredToken() ? "optional" : "none" })),
  cancelOrder: async (orderId, payload) => unwrapData(await request(`/orders/${encodeURIComponent(orderId)}/cancel`, { method: "POST", auth: "required", body: jsonBody(payload) })),
  requestReturn: async (orderId, payload) => unwrapData(await request(`/orders/${encodeURIComponent(orderId)}/returns`, { method: "POST", auth: "required", body: jsonBody(payload) })),
  downloadInvoice: async (orderId) => request(`/orders/${encodeURIComponent(orderId)}/invoice`, { auth: "required" }),
};

export const addressApi = {
  list: async () => extractArray(await request("/addresses", { auth: "required" })),
  create: async (payload) => unwrapData(await request("/addresses", { method: "POST", auth: "required", body: jsonBody(payload) })),
  update: async (id, payload) => unwrapData(await request(`/addresses/${encodeURIComponent(id)}`, { method: "PUT", auth: "required", body: jsonBody(payload) })),
  remove: async (id) => request(`/addresses/${encodeURIComponent(id)}`, { method: "DELETE", auth: "required" }),
  setDefault: async (id) => unwrapData(await request(`/addresses/${encodeURIComponent(id)}/default`, { method: "PUT", auth: "required" })),
};

export const promotionApi = {
  validateCoupon: async (code, items) => unwrapData(await request("/promotions/validate", { method: "POST", auth: getStoredToken() ? "optional" : "none", body: jsonBody({ code, items }) })),
};

export const deliveryApi = {
  check: async (pincode, productId) => unwrapData(await request(`/delivery/check?pincode=${encodeURIComponent(pincode)}${productId ? `&productId=${encodeURIComponent(productId)}` : ""}`, { auth: "none" })),
};
