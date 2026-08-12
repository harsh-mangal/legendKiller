import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getLocalItem, safeJsonParse, setLocalItem } from "../utils/storage";

const WishlistContext = createContext(null);
const WISHLIST_KEY = "legend_wishlist";
const RECENT_KEY = "legend_recently_viewed";
const MAX_RECENT = 12;

const normalizeItems = (value) => (Array.isArray(value) ? value : []).filter((item) => item?._id && item?.name);
const itemKey = (item) => `${item?.itemType || "PRODUCT"}-${item?._id}`;

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => normalizeItems(safeJsonParse(getLocalItem(WISHLIST_KEY), [])));
  const [recentlyViewed, setRecentlyViewed] = useState(() => normalizeItems(safeJsonParse(getLocalItem(RECENT_KEY), [])));

  useEffect(() => setLocalItem(WISHLIST_KEY, JSON.stringify(wishlist)), [wishlist]);
  useEffect(() => setLocalItem(RECENT_KEY, JSON.stringify(recentlyViewed)), [recentlyViewed]);

  const isWishlisted = useCallback((item) => wishlist.some((entry) => itemKey(entry) === itemKey(item)), [wishlist]);
  const toggleWishlist = useCallback((item) => {
    if (!item?._id) return;
    setWishlist((current) => current.some((entry) => itemKey(entry) === itemKey(item))
      ? current.filter((entry) => itemKey(entry) !== itemKey(item))
      : [item, ...current]);
  }, []);
  const removeWishlist = useCallback((item) => setWishlist((current) => current.filter((entry) => itemKey(entry) !== itemKey(item))), []);
  const clearWishlist = useCallback(() => setWishlist([]), []);
  const addRecentlyViewed = useCallback((item) => {
    if (!item?._id) return;
    setRecentlyViewed((current) => [item, ...current.filter((entry) => itemKey(entry) !== itemKey(item))].slice(0, MAX_RECENT));
  }, []);

  const value = useMemo(() => ({ wishlist, wishlistCount: wishlist.length, recentlyViewed, isWishlisted, toggleWishlist, removeWishlist, clearWishlist, addRecentlyViewed }), [wishlist, recentlyViewed, isWishlisted, toggleWishlist, removeWishlist, clearWishlist, addRecentlyViewed]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside WishlistProvider");
  return context;
}
