import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Coins,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  RotateCcw,
  Truck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import Alert from "../components/ui/Alert";
import { PageLoading } from "../components/ui/PageState";
import StatusBadge from "../components/ui/StatusBadge";
import { getErrorMessage, orderApi } from "../services/api";
import { formatDate, money, shortOrderId } from "../utils/format";

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "";

const API_ORIGIN = API_URL
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

const getImageUrl = (image) => {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  return `${API_ORIGIN}${image.startsWith("/") ? image : `/${image}`}`;
};

const humanize = (value) => {
  if (!value) return "Not available";

  return String(value)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatDateTime = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return formatDate(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getOrderNumber = (order) =>
  order.publicOrderNumber || shortOrderId(order._id);

const getItemQuantity = (items = []) =>
  items.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0,
  );

export default function OrderDetailPage() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadOrder = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await orderApi.getOrderById(orderId);

        const orderData =
          response?.data?.order ||
          response?.data ||
          response?.order ||
          response;

        if (active) {
          setOrder(orderData || null);
        }
      } catch (requestError) {
        if (active) {
          setError(
            getErrorMessage(
              requestError,
              "Unable to load this order.",
            ),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      active = false;
    };
  }, [orderId]);

  const statusHistory = useMemo(() => {
    if (!order) return [];

    if (Array.isArray(order.statusHistory) && order.statusHistory.length) {
      return [...order.statusHistory].sort(
        (first, second) =>
          new Date(first.changedAt || 0).getTime() -
          new Date(second.changedAt || 0).getTime(),
      );
    }

    return [
      {
        status: order.orderStatus,
        note: "Current order status",
        changedAt: order.createdAt,
      },
    ];
  }, [order]);

  if (loading) {
    return <PageLoading label="Loading order…" />;
  }

  return (
    <section className="page-section bg-slate-50/60">
      <div className="container-page max-w-6xl">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 transition hover:text-amber-800"
        >
          <ArrowLeft size={17} />
          Back to orders
        </Link>

        {error ? (
          <Alert type="error" className="mt-6">
            {error}
          </Alert>
        ) : !order ? (
          <Alert className="mt-6">Order not found.</Alert>
        ) : (
          <>
            <OrderHeader order={order} />

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <main className="space-y-6">
                <OrderItems order={order} />

                <OrderTimeline
                  history={statusHistory}
                  currentStatus={order.orderStatus}
                />

                {order.tracking && (
                  <TrackingDetails tracking={order.tracking} />
                )}

                {order.cancellation?.status &&
                  order.cancellation.status !== "NONE" && (
                    <CancellationDetails
                      cancellation={order.cancellation}
                    />
                  )}

                {!!order.returnRequests?.length && (
                  <ReturnRequests
                    requests={order.returnRequests}
                  />
                )}
              </main>

              <aside className="space-y-6">
                <PaymentSummary order={order} />

                {order.shippingAddress && (
                  <DeliveryAddress
                    address={order.shippingAddress}
                  />
                )}

                <OrderInformation order={order} />

                {(Number(order.amyekaCoinsUsed || 0) > 0 ||
                  Number(order.amyekaCoinsEarned || 0) > 0 ||
                  Number(order.amyekaCoinsCredited || 0) > 0) && (
                  <RewardsDetails order={order} />
                )}
              </aside>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function OrderHeader({ order }) {
  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="section-eyebrow">Order</p>

          <h1 className="mt-2 break-all text-2xl font-bold text-slate-950 sm:text-3xl">
            #{getOrderNumber(order)}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Placed on {formatDateTime(order.createdAt)}
          </p>

          {order.invoiceNumber && (
            <p className="mt-1 text-sm text-slate-500">
              Invoice:{" "}
              <span className="font-medium text-slate-700">
                {order.invoiceNumber}
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge value={order.orderStatus} />
          <StatusBadge value={order.paymentStatus} />
        </div>
      </div>
    </div>
  );
}

function OrderItems({ order }) {
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-950">
          Ordered products
        </h2>

        <p className="text-sm text-slate-500">
          {getItemQuantity(items)}{" "}
          {getItemQuantity(items) === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="mt-5 divide-y divide-slate-200">
        {items.length ? (
          items.map((item, index) => (
            <OrderItem
              key={
                item._id ||
                `${item.product?._id || item.combo?._id}-${index}`
              }
              item={item}
            />
          ))
        ) : (
          <p className="py-5 text-sm text-slate-500">
            No product details are available.
          </p>
        )}
      </div>
    </section>
  );
}

function OrderItem({ item }) {
  const quantity = Number(item.quantity || 1);
  const price = Number(item.price || 0);
  const mrp = Number(item.mrp || 0);

  const total =
    item.totalPrice !== undefined
      ? Number(item.totalPrice)
      : price * quantity;

  const imageUrl = getImageUrl(item.image);
  const savingsPerUnit = Math.max(0, mrp - price);

  return (
    <div className="flex gap-4 py-5 first:pt-0 last:pb-0">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 sm:h-24 sm:w-24">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name || "Ordered product"}
            className="h-full w-full object-contain p-2"
            loading="lazy"
          />
        ) : (
          <Package size={28} className="text-slate-300" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-base font-bold leading-6 text-slate-950">
              {item.name ||
                item.product?.name ||
                item.combo?.name ||
                "Product"}
            </h3>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              {item.sku && <span>SKU: {item.sku}</span>}

              {item.itemType && (
                <span>{humanize(item.itemType)}</span>
              )}

              {Number(item.gstRate || 0) > 0 && (
                <span>GST: {item.gstRate}%</span>
              )}
            </div>
          </div>

          <p className="shrink-0 text-base font-bold text-slate-950">
            {money(total)}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">
            Quantity: <strong>{quantity}</strong>
          </span>

          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">
            {money(price)} each
          </span>

          {mrp > price && (
            <span className="rounded-md bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
              MRP{" "}
              <span className="line-through">
                {money(mrp)}
              </span>
            </span>
          )}

          {savingsPerUnit > 0 && (
            <span className="text-xs font-semibold text-emerald-700">
              Save {money(savingsPerUnit * quantity)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderTimeline({ history, currentStatus }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <CheckCircle2 size={21} className="text-amber-700" />

        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Order timeline
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current status: {humanize(currentStatus)}
          </p>
        </div>
      </div>

      <div className="mt-6 ml-3 border-l border-slate-200 pl-7">
        {history.map((entry, index) => {
          const isLatest = index === history.length - 1;
          const isCancelled = entry.status === "CANCELLED";

          return (
            <div
              key={`${entry.status}-${entry.changedAt}-${index}`}
              className="relative pb-7 last:pb-0"
            >
              <span
                className={`absolute -left-[38px] top-0 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white ${
                  isCancelled
                    ? "border-red-500 text-red-500"
                    : isLatest
                      ? "border-amber-600 text-amber-600"
                      : "border-emerald-600 text-emerald-600"
                }`}
              >
                {isLatest ? (
                  <Circle size={8} fill="currentColor" />
                ) : (
                  <CheckCircle2 size={13} />
                )}
              </span>

              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p
                    className={`font-semibold ${
                      isCancelled
                        ? "text-red-700"
                        : "text-slate-950"
                    }`}
                  >
                    {humanize(entry.status)}
                  </p>

                  {entry.note && (
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {entry.note}
                    </p>
                  )}
                </div>

                {entry.changedAt && (
                  <p className="shrink-0 text-xs text-slate-500">
                    {formatDateTime(entry.changedAt)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PaymentSummary({ order }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <CreditCard size={19} className="text-slate-500" />
        <h2 className="text-lg font-bold text-slate-950">
          Payment summary
        </h2>
      </div>

      <div className="mt-5 space-y-3">
        <SummaryRow
          label="Items subtotal"
          value={money(order.itemsPrice || 0)}
        />

        <SummaryRow
          label="Shipping"
          value={
            Number(order.shippingPrice || 0) > 0
              ? money(order.shippingPrice)
              : "Free"
          }
          positive={Number(order.shippingPrice || 0) === 0}
        />

        {Number(order.couponDiscountAmount || 0) > 0 && (
          <SummaryRow
            label={
              order.couponCode
                ? `Coupon (${order.couponCode})`
                : "Coupon discount"
            }
            value={`− ${money(order.couponDiscountAmount)}`}
            positive
          />
        )}

        {Number(order.amyekaDiscountAmount || 0) > 0 && (
          <SummaryRow
            label="Viper Coins discount"
            value={`− ${money(order.amyekaDiscountAmount)}`}
            positive
          />
        )}

        {Number(order.discount || 0) > 0 && (
          <SummaryRow
            label="Additional discount"
            value={`− ${money(order.discount)}`}
            positive
          />
        )}

        {Number(order.taxPrice || 0) > 0 && (
          <SummaryRow
            label="Tax"
            value={money(order.taxPrice)}
          />
        )}

        <SummaryRow
          label="Total"
          value={money(order.totalPrice ?? order.totalAmount)}
          strong
        />
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <SummaryRow
          label="Payment method"
          value={humanize(order.paymentMethod)}
        />

        <div className="mt-3">
          <SummaryRow
            label="Payment status"
            value={humanize(order.paymentStatus)}
          />
        </div>

        {order.paidAt && (
          <p className="mt-3 text-xs text-slate-500">
            Paid on {formatDateTime(order.paidAt)}
          </p>
        )}

        {Number(order.refundAmount || 0) > 0 && (
          <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Refunded amount:{" "}
            <strong>{money(order.refundAmount)}</strong>
          </div>
        )}

        {order.paymentError && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {order.paymentError}
          </div>
        )}

        {order.paymentMethod === "COD" &&
          order.paymentStatus === "PENDING" && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              Payment will be collected when the order is
              delivered.
            </p>
          )}
      </div>
    </section>
  );
}

function DeliveryAddress({ address }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <MapPin size={19} className="text-slate-500" />
        <h2 className="text-lg font-bold text-slate-950">
          Delivery address
        </h2>
      </div>

      <div className="mt-4 text-sm leading-6 text-slate-600">
        {address.fullName && (
          <p className="font-semibold text-slate-950">
            {address.fullName}
          </p>
        )}

        {address.addressLine1 && <p>{address.addressLine1}</p>}
        {address.addressLine2 && <p>{address.addressLine2}</p>}

        <p>
          {[address.city, address.state]
            .filter(Boolean)
            .join(", ")}
          {address.pincode ? ` - ${address.pincode}` : ""}
        </p>

        {address.country && <p>{address.country}</p>}
      </div>

      {(address.phone || address.email) && (
        <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
          {address.phone && (
            <a
              href={`tel:${address.phone}`}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-950"
            >
              <Phone size={15} />
              {address.phone}
            </a>
          )}

          {address.email && (
            <a
              href={`mailto:${address.email}`}
              className="flex items-start gap-2 break-all text-sm text-slate-600 hover:text-slate-950"
            >
              <Mail size={15} className="mt-1 shrink-0" />
              {address.email}
            </a>
          )}
        </div>
      )}
    </section>
  );
}

function OrderInformation({ order }) {
  const itemCount = getItemQuantity(order.items || []);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <FileText size={19} className="text-slate-500" />
        <h2 className="text-lg font-bold text-slate-950">
          Order information
        </h2>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <InformationRow
          label="Order number"
          value={getOrderNumber(order)}
        />

        <InformationRow
          label="Placed on"
          value={formatDate(order.createdAt)}
        />

        <InformationRow
          label="Total items"
          value={itemCount}
        />

        {order.invoiceNumber && (
          <InformationRow
            label="Invoice number"
            value={order.invoiceNumber}
          />
        )}

        <InformationRow
          label="Order type"
          value={order.guestCheckout ? "Guest order" : "Account order"}
        />
      </div>
    </section>
  );
}

function TrackingDetails({ tracking }) {
  const hasTrackingDetails =
    tracking.courierName ||
    tracking.trackingNumber ||
    tracking.shippedAt ||
    tracking.deliveredAt;

  if (!hasTrackingDetails) return null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <Truck size={21} className="text-slate-500" />
        <h2 className="text-xl font-bold text-slate-950">
          Shipment tracking
        </h2>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {tracking.courierName && (
          <DetailBox
            label="Courier"
            value={tracking.courierName}
          />
        )}

        {tracking.trackingNumber && (
          <DetailBox
            label="Tracking number"
            value={tracking.trackingNumber}
          />
        )}

        {tracking.shippedAt && (
          <DetailBox
            label="Shipped on"
            value={formatDateTime(tracking.shippedAt)}
          />
        )}

        {tracking.deliveredAt && (
          <DetailBox
            label="Delivered on"
            value={formatDateTime(tracking.deliveredAt)}
          />
        )}
      </div>

      {tracking.trackingUrl && (
        <a
          href={tracking.trackingUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-outline mt-5 inline-flex items-center gap-2"
        >
          <Truck size={17} />
          Track shipment
        </a>
      )}
    </section>
  );
}

function CancellationDetails({ cancellation }) {
  return (
    <section className="rounded-xl border border-red-200 bg-red-50 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <RotateCcw
          size={20}
          className="mt-0.5 shrink-0 text-red-600"
        />

        <div>
          <h2 className="font-bold text-red-900">
            Cancellation {humanize(cancellation.status)}
          </h2>

          {cancellation.reason && (
            <p className="mt-2 text-sm text-red-800">
              {cancellation.reason}
            </p>
          )}

          {cancellation.resolvedAt && (
            <p className="mt-2 text-xs text-red-700">
              Resolved on {formatDateTime(cancellation.resolvedAt)}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function ReturnRequests({ requests }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-slate-950">
        Return requests
      </h2>

      <div className="mt-4 divide-y divide-slate-200">
        {requests.map((request, index) => (
          <div
            key={request._id || index}
            className="py-4 first:pt-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-950">
                  {request.reason || `Return request ${index + 1}`}
                </p>

                {request.createdAt && (
                  <p className="mt-1 text-xs text-slate-500">
                    Requested on {formatDateTime(request.createdAt)}
                  </p>
                )}
              </div>

              {request.status && (
                <StatusBadge value={request.status} />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RewardsDetails({ order }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Coins size={19} className="text-amber-600" />
        <h2 className="text-lg font-bold text-slate-950">
          Viper Coins
        </h2>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        {Number(order.amyekaCoinsUsed || 0) > 0 && (
          <InformationRow
            label="Coins used"
            value={order.amyekaCoinsUsed}
          />
        )}

        {Number(order.amyekaCoinsEarned || 0) > 0 && (
          <InformationRow
            label="Coins earned"
            value={order.amyekaCoinsEarned}
          />
        )}

        {Number(order.amyekaCoinsCredited || 0) > 0 && (
          <InformationRow
            label="Coins credited"
            value={order.amyekaCoinsCredited}
          />
        )}
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
  positive = false,
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        strong
          ? "border-t border-slate-200 pt-4 text-base font-bold text-slate-950"
          : "text-sm"
      }`}
    >
      <span className={strong ? "" : "text-slate-600"}>
        {label}
      </span>

      <span
        className={
          strong
            ? ""
            : positive
              ? "font-semibold text-emerald-700"
              : "font-semibold text-slate-950"
        }
      >
        {value}
      </span>
    </div>
  );
}

function InformationRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-500">{label}</span>

      <span className="break-all text-right font-semibold text-slate-900">
        {value || "Not available"}
      </span>
    </div>
  );
}

function DetailBox({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}