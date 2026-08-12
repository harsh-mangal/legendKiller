import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Home,
  LockKeyhole,
  MapPin,
  Plus,
  Truck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Alert from "../components/ui/Alert";
import FormField from "../components/ui/FormField";
import ProductImage from "../components/ui/ProductImage";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getErrorMessage, orderApi, promotionApi } from "../services/api";
import {
  isValidPaymentContext,
  openRazorpayPayment,
} from "../services/razorpay";
import { money } from "../utils/format";
import { extractOrder, extractRazorpayOrder, getOrderId } from "../utils/order";
import {
  clearPendingPayment,
  saveOrderResult,
  savePendingPayment,
} from "../utils/orderSession";
import {
  getCheckoutValidationError,
  normalizePhone,
} from "../utils/validation";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

const unwrapUser = (value) => value?.user || value?.data || value || null;

const addressToForm = (address, profile) => ({
  fullName: address?.fullName || profile?.name || profile?.fullName || "",
  email: profile?.email || "",
  phone: address?.phone || profile?.phone || profile?.mobile || "",
  addressLine1: address?.addressLine1 || "",
  addressLine2: address?.addressLine2 || "",
  city: address?.city || "",
  state: address?.state || "",
  pincode: address?.pincode || "",
  country: address?.country || "India",
});

const createNewAddressForm = (profile) => ({
  ...emptyForm,
  fullName: profile?.name || profile?.fullName || "",
  email: profile?.email || "",
  phone: profile?.phone || profile?.mobile || "",
});

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useCart();

  const { user, isLoggedIn, refreshUser } = useAuth();

  const initializedProfileRef = useRef("");

  const profile = useMemo(() => unwrapUser(user), [user]);

  const savedAddresses = useMemo(() => {
    return Array.isArray(profile?.addresses) ? profile.addresses : [];
  }, [profile]);

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [form, setForm] = useState(emptyForm);
  const [addressMode, setAddressMode] = useState("new");
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  useEffect(() => {
    const profileId =
      profile?._id || profile?.id || (isLoggedIn ? "logged-in-user" : "guest");

    if (initializedProfileRef.current === profileId) {
      return;
    }

    initializedProfileRef.current = profileId;

    if (isLoggedIn && savedAddresses.length) {
      const defaultAddress =
        savedAddresses.find((address) => address.isDefault) ||
        savedAddresses[0];

      setSelectedAddressId(defaultAddress?._id || "");

      setAddressMode("saved");

      setForm(addressToForm(defaultAddress, profile));

      return;
    }

    setSelectedAddressId("");
    setAddressMode("new");
    setForm(createNewAddressForm(profile));
  }, [profile, isLoggedIn, savedAddresses]);

  const selectedAddress = useMemo(() => {
    return (
      savedAddresses.find((address) => address._id === selectedAddressId) ||
      null
    );
  }, [savedAddresses, selectedAddressId]);

  const basePayableTotal = useMemo(() => {
    return isLoggedIn ? cart.totalPrice : cart.itemsPrice + cart.shippingPrice;
  }, [isLoggedIn, cart.totalPrice, cart.itemsPrice, cart.shippingPrice]);

  const couponDiscount = Math.min(
    Number(coupon?.discountAmount || 0),
    basePayableTotal,
  );

  const payableTotal = Math.max(basePayableTotal - couponDiscount, 0);

  const update = (event) => {
    const { name, value } = event.target;

    let nextValue = value;

    if (name === "phone") {
      nextValue = value.replace(/[^0-9+\-\s]/g, "");
    }

    if (name === "pincode") {
      nextValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setForm((current) => ({
      ...current,
      [name]: nextValue,
    }));
  };

  const selectSavedAddress = (address) => {
    if (!address) return;

    setSelectedAddressId(address._id || "");
    setAddressMode("saved");
    setForm(addressToForm(address, profile));
    setError("");
  };

  const showNewAddressForm = () => {
    setSelectedAddressId("");
    setAddressMode("new");
    setForm(createNewAddressForm(profile));
    setError("");
  };

  const cancelNewAddress = () => {
    if (!savedAddresses.length) return;

    const defaultAddress =
      savedAddresses.find((address) => address.isDefault) || savedAddresses[0];

    selectSavedAddress(defaultAddress);
  };

  const goToResult = (orderId, status, state = {}) => {
    navigate(`/order-result/${orderId}?status=${status}`, {
      replace: true,
      state,
    });
  };

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCoupon(null);
      setCouponMessage("Enter a coupon code.");
      return;
    }

    setCheckingCoupon(true);
    setCouponMessage("");

    try {
      const response = await promotionApi.validateCoupon(code, cart.apiItems);

      const result = response?.data?.data || response?.data || response;

      if (!result?.valid && !result?.discountAmount) {
        throw new Error(
          result?.message || "This coupon is not valid for your cart.",
        );
      }

      setCoupon({
        ...result,
        code,
      });

      setCouponMessage(result?.message || "Coupon applied successfully.");
    } catch (requestError) {
      setCoupon(null);

      setCouponMessage(
        getErrorMessage(requestError, "This coupon could not be applied."),
      );
    } finally {
      setCheckingCoupon(false);
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (
      addressMode === "saved" &&
      savedAddresses.length &&
      !selectedAddressId
    ) {
      setError("Select a delivery address or add a new address.");
      return;
    }

    const validationError = getCheckoutValidationError(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (cart.isValidatingCart) {
      setError("Please wait while we verify current prices and availability.");
      return;
    }

    if (!cart.items.length) {
      setError("Your shopping bag is empty.");
      return;
    }

    if (cart.hasUnavailableItems) {
      setError(
        "One or more cart items are unavailable. Return to your cart and remove them before checkout.",
      );
      return;
    }

    setLoading(true);

    try {
      const shippingAddress = {
        fullName: form.fullName.trim(),
        email: form.email.toLowerCase().trim(),
        phone: normalizePhone(form.phone),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        country: form.country?.trim() || "India",
      };

      const payload = {
        shippingAddress,
        paymentMethod,
        items: cart.apiItems,
        useAmeykaCoins: Boolean(isLoggedIn && cart.useCoins),
        couponCode: coupon?.code || undefined,
      };

      const response = isLoggedIn
        ? await orderApi.createOrder(payload)
        : await orderApi.createGuestOrder(payload);

      const order = extractOrder(response);
      const orderId = getOrderId(order);

      if (!orderId) {
        throw new Error(
          "The order was created without a valid order number. Please contact support.",
        );
      }

      const resultData = {
        order,
        status: paymentMethod === "COD" ? "success" : "pending",
        paymentMethod,
        customerEmail: shippingAddress.email,
        total: Number(order.totalPrice ?? order.totalAmount ?? payableTotal),
        createdAt: new Date().toISOString(),
      };

      saveOrderResult(orderId, resultData);

      cart.clearCart();

      if (isLoggedIn) {
        refreshUser().catch(() => {});
      }

      if (paymentMethod === "COD") {
        goToResult(orderId, "success");
        return;
      }

      const razorpay = extractRazorpayOrder(response);

      const paymentContext = {
        key: razorpay?.key || RAZORPAY_KEY_ID,
        razorpayOrderId: razorpay?.orderId || razorpay?.razorpayOrderId,
        amount: razorpay?.amount,
        currency: razorpay?.currency || "INR",
        localOrderId: orderId,
        customer: {
          name: shippingAddress.fullName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
        },
      };

      if (!isValidPaymentContext(paymentContext)) {
        goToResult(orderId, "pending", {
          message:
            "The order was saved, but the payment provider did not return valid checkout details. Please contact support with your order number.",
        });
        return;
      }

      savePendingPayment(orderId, paymentContext);

      try {
        const verifiedResponse = await openRazorpayPayment({
          ...paymentContext,

          onVerify: (payment) =>
            orderApi.verifyRazorpayPayment({
              orderId,
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
            }),
        });

        const paidOrder = extractOrder(verifiedResponse) || order;

        saveOrderResult(orderId, {
          ...resultData,
          order: paidOrder,
          status: "success",
        });

        clearPendingPayment(orderId);

        if (isLoggedIn) {
          refreshUser().catch(() => {});
        }

        goToResult(orderId, "success");
      } catch (paymentError) {
        goToResult(orderId, "pending", {
          message: getErrorMessage(paymentError),
        });
      }
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to place your order. Please review the details and try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items.length) {
    return (
      <section className="page-section">
        <div className="container-page max-w-2xl text-center">
          <p className="section-eyebrow">Checkout</p>

          <h1 className="section-title mt-3">Your shopping bag is empty</h1>

          <p className="mt-4 text-slate-600">
            Explore the Legend Killer supplement range and add products you would like for
            your everyday wellness routine.
          </p>

          <Link to="/products" className="btn-primary mt-8">
            Explore wellness range
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section bg-slate-50 pb-28 lg:pb-24">
      <div className="container-page grid gap-5 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <form
          id="checkout-form"
          onSubmit={placeOrder}
          className="order-2 border border-slate-200 bg-white p-4 shadow-card sm:rounded-[8px] sm:p-8 lg:order-1"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="section-eyebrow">Safe and simple checkout</p>

              <h1 className="mt-3 text-[1.85rem] font-semibold leading-tight text-slate-950 sm:text-4xl">
                Select delivery address
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Choose a saved address or add a new address for this order.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
              <LockKeyhole size={15} />
              Secure payment
            </span>
          </div>

          {isLoggedIn && savedAddresses.length > 0 && (
            <section className="mt-7 sm:mt-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-base font-semibold text-slate-950">
                  Saved addresses
                </h2>

                <span className="text-xs text-slate-500">
                  {savedAddresses.length}{" "}
                  {savedAddresses.length === 1 ? "address" : "addresses"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {savedAddresses.map((address) => (
                  <AddressCard
                    key={
                      address._id ||
                      `${address.addressLine1}-${address.pincode}`
                    }
                    address={address}
                    selected={
                      addressMode === "saved" &&
                      selectedAddressId === address._id
                    }
                    onSelect={() => selectSavedAddress(address)}
                  />
                ))}

                <button
                  type="button"
                  onClick={showNewAddressForm}
                  className={`flex min-h-[170px] flex-col items-center justify-center rounded-[8px] border-2 border-dashed p-5 text-center transition ${
                    addressMode === "new"
                      ? "border-amber-600 bg-amber-50/60 text-amber-800"
                      : "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm">
                    <Plus size={21} />
                  </span>

                  <span className="mt-3 text-sm font-semibold">
                    Add new address
                  </span>

                  <span className="mt-1 text-xs leading-5 opacity-75">
                    Use another delivery location
                  </span>
                </button>
              </div>
            </section>
          )}

          {addressMode === "saved" && selectedAddress && (
            <section className="mt-7 rounded-[8px] border border-emerald-200 bg-emerald-50/60 p-4 sm:mt-8 sm:p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={21}
                  className="mt-0.5 shrink-0 text-emerald-700"
                />

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-emerald-900">
                    This address will be used for delivery
                  </p>

                  <p className="mt-1 text-sm leading-6 text-emerald-800">
                    {selectedAddress.fullName}
                    {" · "}
                    {selectedAddress.phone}
                  </p>
                </div>
              </div>

              <div className="mt-4 max-w-md">
                <FormField
                  name="email"
                  label="Order updates email"
                  type="email"
                  value={form.email}
                  onChange={update}
                  autoComplete="email"
                  required
                />
              </div>
            </section>
          )}

          {addressMode === "new" && (
            <section className="mt-7 sm:mt-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-950">
                    New delivery address
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter a complete delivery address.
                  </p>
                </div>

                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={cancelNewAddress}
                    className="text-sm font-semibold text-amber-700 hover:text-amber-800"
                  >
                    Use saved address
                  </button>
                )}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5">
                <FormField
                  name="fullName"
                  label="Full name"
                  value={form.fullName}
                  onChange={update}
                  autoComplete="name"
                  required
                />

                <FormField
                  name="email"
                  label="Email address"
                  type="email"
                  value={form.email}
                  onChange={update}
                  autoComplete="email"
                  required
                />

                <FormField
                  name="phone"
                  label="Mobile number"
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={update}
                  autoComplete="tel"
                  required
                />

                <FormField
                  name="pincode"
                  label="Pincode"
                  inputMode="numeric"
                  maxLength={6}
                  value={form.pincode}
                  onChange={update}
                  autoComplete="postal-code"
                  required
                />

                <FormField
                  name="addressLine1"
                  label="House / flat, building and street"
                  value={form.addressLine1}
                  onChange={update}
                  autoComplete="address-line1"
                  className="sm:col-span-2"
                  required
                />

                <FormField
                  name="addressLine2"
                  label="Landmark or area (optional)"
                  value={form.addressLine2}
                  onChange={update}
                  autoComplete="address-line2"
                  className="sm:col-span-2"
                />

                <FormField
                  name="city"
                  label="City"
                  value={form.city}
                  onChange={update}
                  autoComplete="address-level2"
                  required
                />

                <FormField
                  name="state"
                  label="State"
                  value={form.state}
                  onChange={update}
                  autoComplete="address-level1"
                  required
                />

                <FormField
                  name="country"
                  label="Country"
                  value={form.country || "India"}
                  readOnly
                  className="sm:col-span-2"
                />
              </div>
            </section>
          )}

          <div className="mt-8 border-t border-slate-200 pt-8 sm:mt-10">
            <p className="text-sm font-semibold text-slate-950">
              Payment method
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <PaymentOption
                active={paymentMethod === "COD"}
                onClick={() => setPaymentMethod("COD")}
                icon={Truck}
                title="Cash on delivery"
                description="Pay when your order arrives"
              />

              <PaymentOption
                active={paymentMethod === "ONLINE"}
                onClick={() => setPaymentMethod("ONLINE")}
                icon={CreditCard}
                title="Online payment"
                description="UPI, cards and supported wallets"
              />
            </div>
          </div>

          <div className="mt-7 border border-slate-200 bg-slate-50 p-4 sm:mt-8 sm:rounded-[8px] sm:p-5">
            <p className="text-sm font-semibold text-slate-950">Coupon code</p>

            <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <input
                value={couponCode}
                onChange={(event) => {
                  setCouponCode(event.target.value.toUpperCase());

                  if (coupon) {
                    setCoupon(null);
                  }

                  setCouponMessage("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyCoupon();
                  }
                }}
                placeholder="Enter coupon"
                className="min-w-0 flex-1 px-4 py-3 text-sm uppercase"
              />

              <button
                type="button"
                onClick={applyCoupon}
                disabled={checkingCoupon}
                className="btn-outline w-full px-5 py-3 sm:w-auto"
              >
                {checkingCoupon ? "Checking…" : coupon ? "Reapply" : "Apply"}
              </button>
            </div>

            {couponMessage && (
              <p
                className={`mt-3 text-sm ${
                  coupon ? "text-emerald-700" : "text-red-600"
                }`}
              >
                {couponMessage}
              </p>
            )}
          </div>

          {error && (
            <Alert type="error" className="mt-6">
              {error}
            </Alert>
          )}

          <button
            type="submit"
            disabled={loading || cart.isValidatingCart}
            className="btn-primary mt-8 hidden w-full lg:inline-flex lg:w-auto"
          >
            {loading
              ? "Processing order…"
              : paymentMethod === "ONLINE"
                ? `Pay ${money(payableTotal)}`
                : "Place order"}
          </button>
        </form>

        <aside className="order-1 border border-slate-200 bg-white p-4 shadow-card sm:rounded-[8px] sm:p-6 lg:order-2 lg:sticky lg:top-28">
          <h2 className="text-xl font-semibold text-slate-950">
            Order summary
          </h2>

          <div className="touch-scroll mt-4 max-h-56 space-y-2.5 overflow-y-auto pr-1 sm:mt-5 sm:max-h-72 sm:space-y-3">
            {cart.items.map((item) => (
              <div
                key={`${item.itemType}-${item.product._id}`}
                className="flex gap-3 border border-slate-200 p-2.5 sm:rounded-[6px] sm:p-3"
              >
                <ProductImage
                  src={item.product.images?.[0]}
                  alt={item.product.name}
                  className="h-16 w-16 rounded-[4px] object-cover"
                  fallbackClassName="h-16 w-16 rounded-[4px]"
                />

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold text-slate-950">
                    {item.product.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Quantity: {item.quantity}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-semibold text-slate-900">
                  {money(Number(item.product.price || 0) * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm">
            <SummaryRow label="Items" value={money(cart.itemsPrice)} />

            <SummaryRow
              label="Estimated shipping"
              value={cart.shippingPrice ? money(cart.shippingPrice) : "Free"}
              positive={!cart.shippingPrice}
            />

            {isLoggedIn && cart.ameykaDiscountAmount > 0 && (
              <SummaryRow
                label="Coin discount"
                value={`− ${money(cart.ameykaDiscountAmount)}`}
                positive
              />
            )}

            {couponDiscount > 0 && (
              <SummaryRow
                label={`Coupon (${coupon?.code})`}
                value={`− ${money(couponDiscount)}`}
                positive
              />
            )}

            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-semibold text-slate-950">
              <span>Estimated total</span>

              <span>{money(payableTotal)}</span>
            </div>

            <p className="text-xs leading-5 text-slate-500">
              The server verifies price, stock, shipping, discounts and the
              final payable amount before confirming the order.
            </p>
          </div>

          {addressMode === "saved" && selectedAddress && (
            <div className="mt-5 rounded-[8px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <MapPin size={17} className="text-slate-600" />

                <p className="text-sm font-semibold text-slate-950">
                  Delivering to
                </p>
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {selectedAddress.fullName}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                {selectedAddress.addressLine1}
                {selectedAddress.addressLine2
                  ? `, ${selectedAddress.addressLine2}`
                  : ""}
                , {selectedAddress.city}, {selectedAddress.state}{" "}
                {selectedAddress.pincode}
              </p>
            </div>
          )}
        </aside>
      </div>

      <div className="mobile-safe-bottom fixed inset-x-0 bottom-0 z-[80] border-t border-slate-200 bg-white/95 px-4 pt-3 shadow-[0_-8px_24px_rgba(41,45,38,0.12)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-500">Payable total</p>

            <p className="text-lg font-bold text-slate-950">
              {money(payableTotal)}
            </p>
          </div>

          <button
            form="checkout-form"
            type="submit"
            disabled={loading || cart.isValidatingCart}
            className="btn-primary min-w-[160px] px-5"
          >
            {loading
              ? "Processing…"
              : paymentMethod === "ONLINE"
                ? "Pay now"
                : "Place order"}
          </button>
        </div>
      </div>
    </section>
  );
}

function AddressCard({ address, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative min-h-[170px] rounded-[8px] border p-5 text-left transition ${
        selected
          ? "border-amber-700 bg-amber-50/60 shadow-sm ring-1 ring-amber-700"
          : "border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid h-10 w-10 place-items-center rounded-full ${
            selected ? "bg-amber-700 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          <Home size={18} />
        </span>

        {selected && <CheckCircle2 size={21} className="text-amber-700" />}
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-950">
            {address.fullName || "Delivery address"}
          </p>

          {address.isDefault && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              Default
            </span>
          )}
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {address.addressLine1}
          {address.addressLine2 ? `, ${address.addressLine2}` : ""}
          <br />
          {address.city}, {address.state} {address.pincode}
        </p>

        {address.phone && (
          <p className="mt-2 text-xs font-medium text-slate-500">
            {address.phone}
          </p>
        )}
      </div>
    </button>
  );
}

function PaymentOption({ active, onClick, icon: Icon, title, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-between gap-4 rounded-[6px] border p-4 text-left transition ${
        active
          ? "border-slate-950 bg-slate-950 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
      }`}
    >
      <span>
        <span className="block text-sm font-semibold">{title}</span>

        <span
          className={`mt-1 block text-xs ${
            active ? "text-slate-300" : "text-slate-500"
          }`}
        >
          {description}
        </span>
      </span>

      <Icon size={20} />
    </button>
  );
}

function SummaryRow({ label, value, positive = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-600">{label}</span>

      <span
        className={`font-semibold ${
          positive ? "text-emerald-700" : "text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
