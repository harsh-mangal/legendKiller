import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { COMMERCE } from "../config/commerce";
import { coinApi, comboApi, productApi, unwrapData } from "../services/api";
import { useAuth } from "./AuthContext";
import { getCoinBalance } from "../utils/order";
import { getLocalItem, removeLocalItem, safeJsonParse, setLocalItem } from "../utils/storage";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "legend_cart";

export const cartItemKey = (item) =>
  `${item?.itemType || item?.product?.itemType || "PRODUCT"}-${item?.product?._id || "unknown"}`;

const normalizeQuantity = (value, product) => {
  const requested = Math.min(COMMERCE.maxItemQuantity, Math.max(1, Math.floor(Number(value || 1))));
  const stock = Number(product?.availableStock || 0);
  if (product?.stockKnown) return stock > 0 ? Math.min(requested, stock) : 1;
  return requested;
};

const sanitizeStoredItems = (value) => {
  const items = Array.isArray(value) ? value : [];
  return items
    .filter((item) => item?.product?._id && item?.product?.name)
    .map((item) => ({
      product: item.product,
      itemType: item.itemType || item.product.itemType || "PRODUCT",
      quantity: normalizeQuantity(item.quantity, item.product),
    }));
};

export function CartProvider({ children }) {
  const { user, isLoggedIn } = useAuth();
  const [items, setItems] = useState(() =>
    sanitizeStoredItems(safeJsonParse(getLocalItem(CART_STORAGE_KEY), []))
  );
  const [useCoins, setUseCoinsState] = useState(false);
  const [coinSetting, setCoinSetting] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isValidatingCart, setIsValidatingCart] = useState(false);
  const refreshedItems = useRef(new Set());

  useEffect(() => {
    setLocalItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const refreshable = items.filter((item) => {
      const key = cartItemKey(item);
      return item.product?.slug && !refreshedItems.current.has(key);
    });
    if (!refreshable.length) return undefined;

    let active = true;
    setIsValidatingCart(true);
    refreshable.forEach((item) => refreshedItems.current.add(cartItemKey(item)));

    Promise.allSettled(
      refreshable.map((item) =>
        (item.itemType || item.product?.itemType) === "COMBO"
          ? comboApi.getComboBySlug(item.product.slug)
          : productApi.getProductBySlug(item.product.slug)
      )
    ).then((results) => {
      if (!active) return;
      const replacements = new Map();
      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value?._id) {
          replacements.set(cartItemKey(refreshable[index]), result.value);
        }
      });
      if (!replacements.size) return;
      setItems((current) =>
        current.map((item) => {
          const freshProduct = replacements.get(cartItemKey(item));
          if (!freshProduct) return item;
          return {
            ...item,
            product: freshProduct,
            itemType: freshProduct.itemType || item.itemType,
            quantity: normalizeQuantity(item.quantity, freshProduct),
          };
        })
      );
    }).finally(() => {
      if (active) setIsValidatingCart(false);
    });

    return () => {
      active = false;
    };
  }, [items]);

  useEffect(() => {
    let active = true;
    if (!isLoggedIn) {
      setCoinSetting(null);
      setUseCoinsState(false);
      return undefined;
    }

    coinApi
      .getSetting()
      .then((response) => {
        if (active) setCoinSetting(unwrapData(response) || null);
      })
      .catch(() => {
        if (active) {
          setCoinSetting(null);
          setUseCoinsState(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((value) => !value), []);

  const addToCart = useCallback((product, quantity = 1) => {
    if (!product?._id || !product?.name) return false;
    if (product.stockKnown && Number(product.availableStock || 0) <= 0) return false;
    const normalizedProduct = { ...product, itemType: product.itemType || "PRODUCT" };
    const key = `${normalizedProduct.itemType}-${normalizedProduct._id}`;

    setItems((current) => {
      const existing = current.find((item) => cartItemKey(item) === key);
      if (!existing) {
        return [
          ...current,
          {
            product: normalizedProduct,
            itemType: normalizedProduct.itemType,
            quantity: normalizeQuantity(quantity, normalizedProduct),
          },
        ];
      }

      return current.map((item) =>
        cartItemKey(item) === key
          ? { ...item, quantity: normalizeQuantity(item.quantity + Number(quantity || 1), item.product) }
          : item
      );
    });
    return true;
  }, []);

  const updateQuantity = useCallback((keyOrId, quantity) => {
    setItems((current) =>
      current.map((item) =>
        cartItemKey(item) === keyOrId || item.product?._id === keyOrId
          ? { ...item, quantity: normalizeQuantity(quantity, item.product) }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((keyOrId) => {
    setItems((current) =>
      current.filter((item) => cartItemKey(item) !== keyOrId && item.product?._id !== keyOrId)
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setUseCoinsState(false);
    removeLocalItem(CART_STORAGE_KEY);
  }, []);

  const setUseCoins = useCallback(
    (enabled) => setUseCoinsState(Boolean(enabled && isLoggedIn && coinSetting)),
    [isLoggedIn, coinSetting]
  );

  const apiItems = useMemo(
    () =>
      items.map((item) => {
        const type = item.itemType || item.product?.itemType || "PRODUCT";
        return {
          itemType: type,
          ...(type === "COMBO" ? { comboId: item.product?._id } : { productId: item.product?._id }),
          quantity: item.quantity,
        };
      }),
    [items]
  );

  const itemsPrice = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 1),
        0
      ),
    [items]
  );

  const shippingPrice =
    itemsPrice === 0 || itemsPrice >= COMMERCE.freeShippingThreshold
      ? 0
      : COMMERCE.estimatedShippingCharge;
  const subtotal = itemsPrice + shippingPrice;
  const availableCoins = getCoinBalance(user);
  const coinValue = Number(coinSetting?.coinValueInRupees || coinSetting?.coinValue || 0);
  const maxRedeemPercentage = Number(coinSetting?.maxRedeemPercentage || 0);
  const maxRedeemAmount = (subtotal * maxRedeemPercentage) / 100;
  const ameykaDiscountAmount = useCoins
    ? Math.min(availableCoins * coinValue, maxRedeemAmount)
    : 0;
  const ameykaCoinsUsed = coinValue > 0 ? Math.floor(ameykaDiscountAmount / coinValue) : 0;
  const totalPrice = Math.max(subtotal - ameykaDiscountAmount, 0);
  const cartCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const hasUnavailableItems = items.some(
    (item) => item.product?.stockKnown && Number(item.product?.availableStock || 0) <= 0
  );

  const value = useMemo(
    () => ({
      items,
      apiItems,
      cartCount,
      hasUnavailableItems,
      isValidatingCart,
      itemsPrice,
      shippingPrice,
      totalPrice,
      availableCoins,
      coinSetting,
      canUseCoins: Boolean(isLoggedIn && coinSetting && availableCoins > 0),
      useCoins,
      setUseCoins,
      ameykaCoinsUsed,
      ameykaDiscountAmount,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      itemKey: cartItemKey,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
    }),
    [
      items,
      apiItems,
      cartCount,
      hasUnavailableItems,
      isValidatingCart,
      itemsPrice,
      shippingPrice,
      totalPrice,
      availableCoins,
      coinSetting,
      isLoggedIn,
      useCoins,
      setUseCoins,
      ameykaCoinsUsed,
      ameykaDiscountAmount,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
};
