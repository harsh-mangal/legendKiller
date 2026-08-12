import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, CreditCard, PackageCheck } from "lucide-react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import Alert from "../components/ui/Alert";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, orderApi } from "../services/api";
import { isValidPaymentContext, openRazorpayPayment } from "../services/razorpay";
import { money, shortOrderId } from "../utils/format";
import { clearPendingPayment, getOrderResult, getPendingPayment, saveOrderResult } from "../utils/orderSession";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export default function OrderResultPage() {
  const { orderId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { isLoggedIn, refreshUser } = useAuth();
  const result = useMemo(() => getOrderResult(orderId), [orderId]);
  const paymentContext = useMemo(() => getPendingPayment(orderId), [orderId]);
  const queryStatus = searchParams.get("status");
  const [status, setStatus] = useState(() => result?.status || (queryStatus === "success" ? "pending" : queryStatus) || "pending");
  const [retrying, setRetrying] = useState(false);
  const [message, setMessage] = useState(location.state?.message || "");

  useEffect(() => {
    setStatus(result?.status || (queryStatus === "success" ? "pending" : queryStatus) || "pending");
    setMessage(location.state?.message || "");
  }, [orderId, queryStatus, result, location.state]);

  const knownOrder = Boolean(result || paymentContext);
  const success = knownOrder && status === "success";
  const isCashOnDelivery = result?.paymentMethod === "COD";
  const paymentLabel = isCashOnDelivery ? "Due on delivery" : success ? "Paid" : "Pending";
  const retryContext = paymentContext
    ? { ...paymentContext, key: paymentContext.key || RAZORPAY_KEY_ID }
    : null;
  const canRetry = Boolean(retryContext && isValidPaymentContext(retryContext));

  const retryPayment = async () => {
    if (!canRetry || retrying) return;
    setRetrying(true);
    setMessage("");
    try {
      await openRazorpayPayment({
        ...retryContext,
        onVerify: (payment) =>
          orderApi.verifyRazorpayPayment({
            orderId,
            razorpay_order_id: payment.razorpay_order_id,
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature: payment.razorpay_signature,
          }),
      });
      clearPendingPayment(orderId);
      saveOrderResult(orderId, {
        ...(result || {}),
        status: "success",
        paymentMethod: result?.paymentMethod || "ONLINE",
        total: result?.total ?? (Number(retryContext?.amount || 0) / 100 || undefined),
        createdAt: result?.createdAt || new Date().toISOString(),
      });
      setStatus("success");
      setSearchParams({ status: "success" }, { replace: true });
      if (isLoggedIn) refreshUser().catch(() => {});
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setRetrying(false);
    }
  };

  return (
    <section className="page-section bg-slate-50">
      <div className="container-page max-w-3xl">
        <div className="border border-slate-200 bg-white p-4 text-center shadow-card sm:rounded-[8px] sm:p-10">
          <span className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${success ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
            {success ? <CheckCircle2 size={30} /> : <AlertTriangle size={30} />}
          </span>
          <p className="section-eyebrow mt-6">Order #{shortOrderId(orderId)}</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
            {!knownOrder
              ? "Order details are not available in this browser"
              : success
                ? "Your order is confirmed"
                : "Your order is saved, but payment is pending"}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
            {!knownOrder
              ? "Open the confirmation link in the browser used for checkout, view the order from your account, or contact support with the order number."
              : success
                ? "We have received your order. Keep the order number for support and status updates."
                : "No additional order is required. Retry the existing payment below or contact support with your order number."}
          </p>

          {message && <Alert type={success ? "info" : "error"} className="mt-6 text-left">{message}</Alert>}

          <div className="mt-8 grid gap-3 rounded-[6px] border border-slate-200 bg-slate-50 p-5 text-left sm:grid-cols-2">
            <Info label="Order number" value={`#${shortOrderId(orderId)}`} />
            {knownOrder && <Info label="Payment" value={paymentLabel} />}
            {result?.paymentMethod && <Info label="Payment method" value={result.paymentMethod === "COD" ? "Cash on delivery" : "Online payment"} />}
            {result?.total != null && <Info label="Order total" value={money(result.total)} />}
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {!success && canRetry && (
              <button type="button" onClick={retryPayment} disabled={retrying} className="btn-primary">
                <CreditCard size={18} /> {retrying ? "Opening payment…" : "Retry payment"}
              </button>
            )}
            {isLoggedIn ? (
              <Link to="/orders" className="btn-outline"><PackageCheck size={18} /> View my orders</Link>
            ) : (
              <Link to="/products" className="btn-outline">Continue shopping</Link>
            )}
            {!success && <Link to="/contact" className="btn-outline">Contact support</Link>}
          </div>

          {knownOrder && !success && !canRetry && (
            <Alert type="info" className="mt-7 text-left">
              Payment retry details are not available in this browser. Contact support with the order number instead of placing a duplicate order.
            </Alert>
          )}

          {knownOrder && !isLoggedIn && (
            <p className="mt-7 text-xs leading-5 text-slate-500">
              Guest checkout details are retained only for this browser session. Save your order number for future support requests.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}
