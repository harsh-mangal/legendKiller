import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { money } from "../../utils/format";
import { COMMERCE } from "../../config/commerce";

function Row({ label, value, strong = false }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? "text-lg font-black uppercase text-white" : "text-sm"}`}>
      <span className={strong ? "" : "text-slate-300"}>{label}</span>
      <span className={strong ? "text-[#FFB800]" : "font-bold text-white"}>{value}</span>
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
      <h2 className="text-xl font-black uppercase tracking-wider text-white">Order Summary</h2>
      {itemsPrice > 0 && (
        <div className="mt-4 border border-emerald-800 bg-emerald-950/40 p-3.5 rounded-none">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-bold text-emerald-400">
              {amountToFreeShipping > 0 ? `Add ${money(amountToFreeShipping)} for free express delivery` : "Free express delivery unlocked"}
            </span>
            <span className="font-extrabold text-emerald-300">{Math.round(shippingProgress)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-none bg-slate-900" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(shippingProgress)} aria-label="Free delivery progress">
            <span className="block h-full rounded-none bg-gradient-to-r from-[#FFB800] to-[#FF5500] transition-all duration-500" style={{ width: `${shippingProgress}%` }} />
          </div>
        </div>
      )}
      <div className="mt-5 space-y-3">
        <Row label="Items Subtotal" value={money(itemsPrice)} />
        <Row label="Estimated Delivery" value={shippingPrice ? money(shippingPrice) : "FREE"} />

        <div className="border-y border-slate-800 py-4">
          {isLoggedIn ? (
            <label className={`flex items-center justify-between gap-4 ${canUseCoins ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}>
              <span>
                <span className="block text-sm font-bold uppercase text-white">Redeem Viper Coins</span>
                <span className="mt-1 block text-xs text-slate-400">
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
            <p className="text-sm text-slate-300">
              <Link to="/login" state={{ from: "/cart" }} className="font-bold text-[#FFB800] hover:underline">
                Log In
              </Link>{" "}
              to redeem Viper Coins and earn reward points.
            </p>
          )}
        </div>

        {useCoins && ameykaDiscountAmount > 0 && (
          <Row label={`Viper Coin Discount (${ameykaCoinsUsed} coins)`} value={`− ${money(ameykaDiscountAmount)}`} />
        )}

        <div className="border-t border-slate-800 pt-4">
          <Row label="Estimated Total" value={money(totalPrice)} strong />
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Final supplement pricing, stock, and coin redemptions are verified before checkout.
          </p>
        </div>
      </div>

      {showCheckout && (
        isValidatingCart ? (
          <div className="mt-6 rounded-none border border-slate-800 bg-[#1A1A22] p-4 text-sm font-bold text-slate-300">
            Validating supplement stock and pricing…
          </div>
        ) : hasUnavailableItems ? (
          <div className="mt-6 rounded-none border border-red-800 bg-red-950/50 p-4 text-sm font-bold text-red-400">
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
