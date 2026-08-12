import { SITE } from "../config/site";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
const SCRIPT_TIMEOUT_MS = 15000;

let scriptPromise = null;

const removeScript = (script) => {
  try {
    script?.remove();
  } catch {
    // A detached script needs no further cleanup.
  }
};

export const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    const staleScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
    if (staleScript && !window.Razorpay) removeScript(staleScript);

    const script = document.createElement("script");
    let settled = false;
    const timeoutId = window.setTimeout(() => finish(false), SCRIPT_TIMEOUT_MS);

    const finish = (loaded) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      script.onload = null;
      script.onerror = null;
      if (!loaded) removeScript(script);
      resolve(Boolean(loaded && window.Razorpay));
    };

    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => finish(true);
    script.onerror = () => finish(false);
    document.body.appendChild(script);
  }).then((loaded) => {
    if (!loaded) scriptPromise = null;
    return loaded;
  });

  return scriptPromise;
};

const paymentError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

export const isValidPaymentContext = ({ key, razorpayOrderId, amount }) =>
  Boolean(key && razorpayOrderId && Number.isFinite(Number(amount)) && Number(amount) > 0);

export const openRazorpayPayment = async ({
  key,
  razorpayOrderId,
  amount,
  currency = "INR",
  localOrderId,
  customer,
  onVerify,
}) => {
  if (!isValidPaymentContext({ key, razorpayOrderId, amount }) || typeof onVerify !== "function") {
    throw paymentError(
      "Online payment is temporarily unavailable because the payment configuration is incomplete.",
      "PAYMENT_CONFIG_INVALID"
    );
  }

  const loaded = await loadRazorpay();
  if (!loaded || !window.Razorpay) {
    throw paymentError(
      "Online payment could not be loaded. Please check your connection and try again.",
      "SDK_LOAD_FAILED"
    );
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const settle = (callback, value) => {
      if (settled) return;
      settled = true;
      callback(value);
    };

    try {
      const instance = new window.Razorpay({
        key,
        amount: Math.round(Number(amount)),
        currency,
        order_id: razorpayOrderId,
        name: SITE.name,
        description: `Order #${String(localOrderId || "").slice(-8).toUpperCase()}`,
        prefill: {
          name: customer?.name || "",
          email: customer?.email || "",
          contact: customer?.phone || "",
        },
        notes: {
          localOrderId,
          brand: SITE.name,
        },
        theme: { color: "#0f172a" },
        handler: async (response) => {
          try {
            const verified = await onVerify(response);
            settle(resolve, verified);
          } catch (error) {
            settle(reject, error);
          }
        },
        modal: {
          ondismiss: () =>
            settle(
              reject,
              paymentError(
                "Payment was not completed. Your order is saved and you can retry payment from the order status page.",
                "PAYMENT_CANCELLED"
              )
            ),
        },
      });

      instance.on("payment.failed", (response) => {
        settle(
          reject,
          paymentError(
            response?.error?.description || "Payment failed. Please retry or choose another payment method.",
            "PAYMENT_FAILED"
          )
        );
      });

      instance.open();
    } catch (error) {
      settle(
        reject,
        error instanceof Error
          ? error
          : paymentError("Online payment could not be opened. Please try again.", "PAYMENT_OPEN_FAILED")
      );
    }
  });
};
