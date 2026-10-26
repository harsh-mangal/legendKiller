import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { money } from "../../utils/format";
import { COMMERCE } from "../../config/commerce";

function Row({ label, value, strong = false, light = false }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? `text-lg font-black uppercase ${light ? "text-slate-950" : "text-white"}` : "text-sm"}`}>
      <span className={strong ? "" : light ? "text-slate-600" : "text-slate-300"}>{label}</span>
      <span className={strong ? "text-[#FFB800]" : `font-bold ${light ? "text-slate-950" : "text-white"}`}>{value}</span>
    </div>
  );
}

export default function CartSummary({ onCheckout, showCheckout = true, compact = false }) {
  const { isLoggedIn } = useAuth();
  const {
    itemsPrice,
    shippingPrice,
    totalPrice,
    useCoins,
    setUseCoins,
    ameykaCoinsUsed,
    ameykaDiscountAmount,
    availableCoins,
    canUseCoins,
    hasUnavailableItems,
    isValidatingCart,
  } = useCart();

  const shippingTarget = Math.max(COMMERCE.freeShippingThreshold, 1);
  const shippingProgress = Math.min(100, (itemsPrice / shippingTarget) * 100);
  const amountToFreeShipping = Math.max(COMMERCE.freeShippingThreshold - itemsPrice, 0);

  return (
    <div className={`${compact ? "" : "rounded-none border border-slate-800 bg-[#121216] p-5 shadow-2xl sm:p-6"}`}>
      <h2 className={`text-xl font-black uppercase tracking-wider ${compact ? "text-slate-950" : "text-white"}`}>Order Summary</h2>
      {itemsPrice > 0 && (
        <div className={`mt-4 border p-3.5 rounded-none ${compact ? "border-emerald-200 bg-emerald-50" : "border-emerald-800 bg-emerald-950/40"}`}>
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className={`font-bold ${compact ? "text-emerald-700" : "text-emerald-400"}`}>
              {amountToFreeShipping > 0 ? `Add ${money(amountToFreeShipping)} for free express delivery` : "Free express delivery unlocked"}
            </span>
            <span className={`font-extrabold ${compact ? "text-emerald-700" : "text-emerald-300"}`}>{Math.round(shippingProgress)}%</span>
          </div>
          <div className={`mt-2 h-2 overflow-hidden rounded-none ${compact ? "bg-slate-200" : "bg-slate-900"}`} role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(shippingProgress)} aria-label="Free delivery progress">
            <span className="block h-full rounded-none bg-gradient-to-r from-[#FFB800] to-[#FF5500] transition-all duration-500" style={{ width: `${shippingProgress}%` }} />
          </div>
        </div>
      )}
      <div className="mt-5 space-y-3">
        <Row label="Items Subtotal" value={money(itemsPrice)} light={compact} />
        <Row label="Estimated Delivery" value={shippingPrice ? money(shippingPrice) : "FREE"} light={compact} />

        <div className={`border-y py-4 ${compact ? "border-slate-200" : "border-slate-800"}`}>
          {isLoggedIn ? (
            <label className={`flex items-center justify-between gap-4 ${canUseCoins ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}>
              <span>
                <span className={`block text-sm font-bold uppercase ${compact ? "text-slate-950" : "text-white"}`}>Redeem Viper Coins</span>
                <span className={`mt-1 block text-xs ${compact ? "text-slate-500" : "text-slate-400"}`}>
                  {availableCoins > 0 ? `${availableCoins} Viper Coins available` : "No Viper Coins available"}
                </span>
              </span>
              <input
                type="checkbox"
                checked={useCoins}
                disabled={!canUseCoins}
                onChange={(event) => setUseCoins(event.target.checked)}
                className="h-5 w-5 accent-[#FF5500] rounded-none"
              />
            </label>
          ) : (
            <p className={`text-sm ${compact ? "text-slate-600" : "text-slate-300"}`}>
              <Link to="/login" state={{ from: "/cart" }} className="font-bold text-[#FFB800] hover:underline">
                Log In
              </Link>{" "}
              to redeem Viper Coins and earn reward points.
            </p>
          )}
        </div>

        {useCoins && ameykaDiscountAmount > 0 && (
          <Row label={`Viper Coin Discount (${ameykaCoinsUsed} coins)`} value={`− ${money(ameykaDiscountAmount)}`} light={compact} />
        )}

        <div className={`border-t pt-4 ${compact ? "border-slate-200" : "border-slate-800"}`}>
          <Row label="Estimated Total" value={money(totalPrice)} strong light={compact} />
          <p className={`mt-2 text-xs leading-5 ${compact ? "text-slate-500" : "text-slate-400"}`}>
            Final supplement pricing, stock, and coin redemptions are verified before checkout.
          </p>
        </div>
      </div>

      {showCheckout && (
        isValidatingCart ? (
          <div className={`mt-6 rounded-none border p-4 text-sm font-bold ${compact ? "border-slate-200 bg-slate-100 text-slate-700" : "border-slate-800 bg-[#1A1A22] text-slate-300"}`}>
            Validating supplement stock and pricing…
          </div>
        ) : hasUnavailableItems ? (
          <div className={`mt-6 rounded-none border p-4 text-sm font-bold ${compact ? "border-red-200 bg-red-50 text-red-700" : "border-red-800 bg-red-950/50 text-red-400"}`}>
            Remove out-of-stock items before continuing to checkout.
          </div>
        ) : (
          <Link to="/checkout" onClick={onCheckout} className="btn-primary mt-6 w-full text-center">
            PROCEED TO CHECKOUT
          </Link>
        )
      )}
    </div>
  );
}
