import { useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/ui/Alert";
import FormField from "../components/ui/FormField";
import StatusBadge from "../components/ui/StatusBadge";
import { getErrorMessage, orderApi } from "../services/api";
import { formatDate, money, shortOrderId } from "../utils/format";

export default function TrackOrderPage() {
  const [form, setForm] = useState({ orderId: "", contact: "" });
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(""); setOrder(null);
    if (!form.orderId.trim() || !form.contact.trim()) return setError("Enter your order number and the email or phone used at checkout.");
    setLoading(true);
    try { setOrder(await orderApi.trackGuestOrder({ orderId: form.orderId.trim(), contact: form.contact.trim() })); }
    catch (err) { setError(getErrorMessage(err, "Unable to find this order.")); }
    finally { setLoading(false); }
  };

  return (
    <section className="page-section bg-[#0A0A0C]">
      <div className="container-page max-w-3xl">
        <form onSubmit={submit} className="border border-slate-800 bg-[#121216] p-5 shadow-2xl rounded-none sm:p-8">
          <p className="section-eyebrow">Delivery Tracking</p>
          <h1 className="mt-3 text-[1.85rem] font-black uppercase leading-tight text-white sm:text-3xl">Track Your Order</h1>
          <p className="mt-3 text-sm text-slate-300">Enter your order ID and the email address or mobile number used at checkout.</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <FormField label="Order ID / Number" name="orderId" value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} required />
            <FormField label="Email or Phone Number" name="contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} required />
          </div>
          {error && <Alert type="error" className="mt-5">{error}</Alert>}
          <button disabled={loading} className="btn-primary mt-6 w-full text-center sm:w-auto">{loading ? "Checking…" : "TRACK ORDER"}</button>
        </form>
        {order && (
          <div className="mt-6 border border-slate-800 bg-[#121216] p-5 shadow-2xl rounded-none sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">Order #{shortOrderId(order._id || order.id)}</p>
                <h2 className="mt-2 text-2xl font-black uppercase text-white">Order Status</h2>
                <p className="mt-2 text-sm text-slate-400">Placed {formatDate(order.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <StatusBadge value={order.orderStatus} />
                <StatusBadge value={order.paymentStatus} />
              </div>
            </div>
            <div className="mt-6 border-t border-slate-800 pt-5">
              <p className="text-sm font-bold text-slate-400">Total Order Value</p>
              <p className="mt-1 text-2xl font-black text-[#FFB800]">{money(order.totalPrice ?? order.totalAmount)}</p>
            </div>
            <Link to="/contact" className="btn-outline mt-6 w-full text-center sm:w-auto">Need Help?</Link>
          </div>
        )}
      </div>
    </section>
  );
}
