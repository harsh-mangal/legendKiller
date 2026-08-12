import { useEffect, useState } from "react";
import {
  ChevronRight,
  Package,
  PackageSearch,
  RefreshCw,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

import Alert from "../components/ui/Alert";
import { EmptyState, PageLoading } from "../components/ui/PageState";
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

const getOrderNumber = (order) =>
  order.publicOrderNumber || shortOrderId(order._id);

const getTotalQuantity = (items = []) =>
  items.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0,
  );

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await orderApi.myOrders();

        if (active) {
          setOrders(Array.isArray(response) ? response : []);
        }
      } catch (requestError) {
        if (active) {
          setError(
            getErrorMessage(
              requestError,
              "Unable to load your orders.",
            ),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  if (loading && !orders.length) {
    return <PageLoading label="Loading your orders…" />;
  }

  return (
    <section className="page-section bg-[#0A0A0C]">
      <div className="container-page">
        <div className="border border-slate-800 bg-[#121216] p-5 shadow-2xl rounded-none sm:p-8">
          <p className="section-eyebrow">Athlete Account</p>

          <h1 className="section-title mt-3">
            MY ORDERS
          </h1>

          <p className="mt-3 max-w-2xl text-slate-300">
            View your supplement orders, payment verification, and live dispatch tracking.
          </p>
        </div>

        {error && (
          <div className="mt-7">
            <Alert type="error">{error}</Alert>

            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="btn-outline mt-3 inline-flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Try Again
            </button>
          </div>
        )}

        {!error && !orders.length ? (
          <div className="mt-8">
            <EmptyState
              title="No Supplement Orders Yet"
              description="Your order history will appear here after checkout."
              action={
                <Link to="/products" className="btn-primary">
                  <PackageSearch size={18} />
                  EXPLORE SUPPLEMENTS
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-5">
            {orders.map((order) => {
              const items = Array.isArray(order.items)
                ? order.items
                : [];

              const totalQuantity = getTotalQuantity(items);
              const visibleItems = items.slice(0, 2);
              const remainingItems = items.length - visibleItems.length;

              return (
                <article
                  key={order._id}
                  className="overflow-hidden rounded-none border border-slate-800 bg-[#121216] shadow-2xl"
                >
                  <div className="flex flex-col gap-4 border-b border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-[#FFB800]">
                        Order
                      </p>

                      <h2 className="mt-1 text-base font-black uppercase text-white">
                        #{getOrderNumber(order)}
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        Placed {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <StatusBadge value={order.orderStatus} />
                      <StatusBadge value={order.paymentStatus} />
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="divide-y divide-slate-800">
                      {visibleItems.map((item) => {
                        const imageUrl = getImageUrl(item.image);

                        return (
                          <div
                            key={item._id}
                            className="flex gap-4 py-4 first:pt-0"
                          >
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-none border border-slate-800 bg-[#0A0A0C]">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={item.name || "Supplement"}
                                  className="h-full w-full object-contain p-1"
                                  loading="lazy"
                                />
                              ) : (
                                <Package
                                  size={23}
                                  className="text-slate-600"
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="line-clamp-2 text-sm font-bold uppercase leading-5 text-white">
                                    {item.name || "Supplement"}
                                  </h3>

                                  <p className="mt-1 text-xs text-slate-400">
                                    Quantity: {item.quantity || 1}
                                  </p>
                                </div>

                                <p className="shrink-0 text-sm font-black text-[#FFB800]">
                                  {money(
                                    item.totalPrice ??
                                      Number(item.price || 0) *
                                        Number(item.quantity || 1),
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {remainingItems > 0 && (
                      <p className="border-t border-slate-800 pt-3 text-sm font-bold text-slate-400">
                        +{remainingItems} more{" "}
                        {remainingItems === 1 ? "supplement" : "supplements"}
                      </p>
                    )}

                    <div className="mt-4 grid gap-3 rounded-none border border-slate-800 bg-[#1A1A22] p-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-black uppercase text-[#FFB800]">
                          Total Items
                        </p>
                        <p className="mt-1 font-bold text-white">
                          {totalQuantity}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase text-[#FFB800]">
                          Payment Method
                        </p>
                        <p className="mt-1 font-bold text-white">
                          {order.paymentMethod || "Not available"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase text-[#FFB800]">
                          Order Total
                        </p>
                        <p className="mt-1 text-lg font-black text-[#FFB800]">
                          {money(
                            order.totalPrice ?? order.totalAmount,
                          )}
                        </p>
                      </div>
                    </div>

                    {order.tracking?.trackingNumber && (
                      <div className="mt-4 flex items-start gap-3 rounded-none border border-slate-800 bg-[#1A1A22] px-4 py-3">
                        <Truck
                          size={19}
                          className="mt-0.5 shrink-0 text-[#FF5500]"
                        />

                        <div>
                          <p className="text-sm font-bold uppercase text-white">
                            {order.tracking.courierName || "Express Courier"}
                          </p>

                          <p className="mt-1 text-xs text-slate-300">
                            Tracking Number:{" "}
                            <span className="font-mono font-bold text-[#FFB800]">{order.tracking.trackingNumber}</span>
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex justify-end">
                      <Link
                        to={`/orders/${order._id}`}
                        className="btn-outline inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                      >
                        VIEW DETAILS
                        <ChevronRight size={17} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}