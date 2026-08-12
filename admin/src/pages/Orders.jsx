import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Eye, PackageCheck, RefreshCw, Search, Truck, Undo2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";
import { Badge, Button, Card, EmptyState, Field, Input, LoadingState, Modal, PageHeader, Pagination, Select, Textarea } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { compactId, currency, dateTime, orderTone, paymentTone } from "../utils/format";
import { getErrorMessage } from "../utils/errors";
import { downloadCsv } from "../utils/csv";

const transitions = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["RETURN_REQUESTED"],
  RETURN_REQUESTED: ["RETURNED", "DELIVERED"],
  RETURNED: [], CANCELLED: [],
};

const addressText = (address = {}) => [address.addressLine1, address.addressLine2, address.city, address.state, address.pincode, address.country].filter(Boolean).join(", ");

export default function Orders() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]); const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 }); const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get("search") || ""); const [orderStatus, setOrderStatus] = useState(params.get("orderStatus") || ""); const [paymentStatus, setPaymentStatus] = useState(params.get("paymentStatus") || "");
  const [selected, setSelected] = useState(null); const [detailLoading, setDetailLoading] = useState(false); const [nextStatus, setNextStatus] = useState(""); const [note, setNote] = useState(""); const [tracking, setTracking] = useState({ courierName: "", trackingNumber: "", trackingUrl: "" }); const [saving, setSaving] = useState(false);
  const [returnAction, setReturnAction] = useState(null); const [returnNote, setReturnNote] = useState("");
  const toast = useToast();

  const page = Number(params.get("page") || 1);
  const load = useCallback(async () => {
    try { setLoading(true); const query = new URLSearchParams({ page: String(page), limit: "25" }); if (params.get("search")) query.set("search", params.get("search")); if (params.get("orderStatus")) query.set("orderStatus", params.get("orderStatus")); if (params.get("paymentStatus")) query.set("paymentStatus", params.get("paymentStatus")); const { data } = await API.get(`/orders?${query}`); setItems(data.data || []); setPagination(data.pagination || { page, pages: 1, total: 0 }); }
    catch (error) { toast.error(getErrorMessage(error, "Orders could not be loaded.")); }
    finally { setLoading(false); }
  }, [page, params, toast]);
  useEffect(() => { load(); }, [load]);

  const openOrder = useCallback(async (id) => {
    try { setDetailLoading(true); const { data } = await API.get(`/orders/${id}`); setSelected(data.data); setNextStatus(""); setNote(""); setTracking({ courierName: data.data?.tracking?.courierName || "", trackingNumber: data.data?.tracking?.trackingNumber || "", trackingUrl: data.data?.tracking?.trackingUrl || "" }); const next = new URLSearchParams(params); next.set("open", id); setParams(next, { replace: true }); }
    catch (error) { toast.error(getErrorMessage(error, "Order details could not be loaded.")); }
    finally { setDetailLoading(false); }
  }, [params, setParams, toast]);

  useEffect(() => { const id = params.get("open"); if (id && selected?._id !== id && !detailLoading) openOrder(id); }, [params, selected, detailLoading, openOrder]);

  const closeOrder = () => { setSelected(null); const next = new URLSearchParams(params); next.delete("open"); setParams(next, { replace: true }); };
  const applyFilters = (event) => { event.preventDefault(); const next = new URLSearchParams(); if (search.trim()) next.set("search", search.trim()); if (orderStatus) next.set("orderStatus", orderStatus); if (paymentStatus) next.set("paymentStatus", paymentStatus); next.set("page", "1"); setParams(next); };
  const clearFilters = () => { setSearch(""); setOrderStatus(""); setPaymentStatus(""); setParams({ page: "1" }); };

  const allowedTransitions = useMemo(() => {
    if (!selected) return [];
    const possible = transitions[selected.orderStatus] || [];
    return possible.filter((status) => !(status !== "CANCELLED" && selected.paymentMethod === "ONLINE" && selected.paymentStatus !== "PAID"));
  }, [selected]);

  const updateStatus = async () => {
    if (!selected || !nextStatus) return;
    if (nextStatus === "SHIPPED" && (!tracking.courierName.trim() || !tracking.trackingNumber.trim())) { toast.error("Courier name and tracking number are required before marking an order shipped."); return; }
    if (nextStatus === "SHIPPED" && tracking.trackingUrl.trim()) {
      try { const url = new URL(tracking.trackingUrl); if (!["http:", "https:"].includes(url.protocol)) throw new Error(); }
      catch { toast.error("Tracking URL must be a valid http or https address."); return; }
    }
    try { setSaving(true); const payload = { orderStatus: nextStatus, note: note.trim(), ...(nextStatus === "SHIPPED" ? tracking : {}) }; const { data } = await API.put(`/orders/${selected._id}/status`, payload); setSelected(data.data); setItems((current) => current.map((order) => order._id === selected._id ? data.data : order)); setNextStatus(""); setNote(""); toast.success(data.message || "Order status updated."); }
    catch (error) { toast.error(getErrorMessage(error, "Order status could not be updated.")); }
    finally { setSaving(false); }
  };

  const openReturnAction = (requestId, status) => { setReturnAction({ requestId, status }); setReturnNote(""); };
  const resolveReturn = async () => {
    if (!selected || !returnAction) return;
    if (returnAction.status === "REJECTED" && returnNote.trim().length < 5) { toast.error("Add a clear rejection reason for the customer record."); return; }
    try { setSaving(true); const { data } = await API.put(`/orders/${selected._id}/returns/${returnAction.requestId}`, { status: returnAction.status, adminNote: returnNote.trim() }); setSelected(data.data); setItems((current) => current.map((order) => order._id === selected._id ? data.data : order)); toast.success(data.message || "Return request updated."); setReturnAction(null); setReturnNote(""); }
    catch (error) { toast.error(getErrorMessage(error, "Return request could not be updated.")); }
    finally { setSaving(false); }
  };

  const printInvoice = async () => {
    const popup = window.open("", "_blank");
    if (!popup) { toast.error("Allow pop-ups for this admin site to open invoices."); return; }
    popup.opener = null;
    popup.document.write(`<title>Preparing invoice…</title><p style="font-family:system-ui;padding:24px">Preparing invoice…</p>`);
    try {
      const { data } = await API.get(`/orders/${selected._id}/invoice`);
      const invoice = data.data;
      popup.document.open();
      popup.document.write(invoice.html || "<p>Invoice unavailable.</p>");
      popup.document.close();
    } catch (error) {
      popup.close();
      toast.error(getErrorMessage(error, "Invoice could not be opened."));
    }
  };

  return <div className="space-y-6">
    <PageHeader eyebrow="Sales and fulfilment" title="Orders" description="Review payment state, inventory reservation, customer details, shipment tracking, cancellations and return requests from one order record." actions={<><Button variant="secondary" onClick={() => downloadCsv(`ameyka-orders-page-${pagination.page || page}.csv`, items, [{ label: "Order", value: (item) => item.publicOrderNumber || item._id }, { label: "Customer", value: (item) => item.shippingAddress?.fullName || item.user?.name || "Guest" }, { label: "Phone", value: (item) => item.shippingAddress?.phone || item.user?.phone || "" }, { label: "Email", value: (item) => item.shippingAddress?.email || item.user?.email || "" }, { label: "Total", value: "totalPrice" }, { label: "Payment method", value: "paymentMethod" }, { label: "Payment status", value: "paymentStatus" }, { label: "Order status", value: "orderStatus" }, { label: "Placed", value: "createdAt" }])} disabled={!items.length}><Download size={17} /> Export page</Button><Button variant="secondary" onClick={load}><RefreshCw size={17} /> Refresh</Button></>} />
    <Card className="overflow-hidden">
      <form onSubmit={applyFilters} className="grid gap-3 border-b border-stone-200 p-4 lg:grid-cols-[1fr_190px_190px_auto]"><div className="relative"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" /><Input className="pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Order number, customer, email or phone" /></div><Select value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)}><option value="">All order statuses</option>{Object.keys(transitions).map((status) => <option key={status}>{status}</option>)}</Select><Select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}><option value="">All payment statuses</option>{["PENDING", "PROCESSING", "PAID", "FAILED", "CANCELLED", "REFUND_PENDING", "REFUNDED"].map((status) => <option key={status}>{status}</option>)}</Select><div className="flex gap-2"><Button type="submit">Apply</Button><Button variant="secondary" onClick={clearFilters}>Clear</Button></div></form>
      {loading ? <LoadingState label="Loading orders…" /> : items.length ? <div className="table-wrap"><table className="data-table min-w-[1160px]"><thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Fulfilment</th><th>Placed</th><th className="text-right">Open</th></tr></thead><tbody>{items.map((order) => <tr key={order._id}><td><p className="font-black text-stone-950">{order.publicOrderNumber || compactId(order._id)}</p><p className="mt-1 text-xs text-stone-500">{order.items?.length || 0} line item(s) · {order.paymentMethod}</p></td><td><p className="font-bold text-stone-900">{order.shippingAddress?.fullName || order.user?.name || "Guest customer"}</p><p className="text-xs text-stone-500">{order.shippingAddress?.phone || order.user?.phone || "No phone"}</p></td><td><p className="font-bold text-stone-950">{currency(order.totalPrice)}</p>{order.couponCode && <p className="text-xs text-stone-500">Coupon {order.couponCode}</p>}</td><td><Badge tone={paymentTone(order.paymentStatus)}>{order.paymentStatus}</Badge>{order.razorpayPaymentId && <p className="mt-1 max-w-[150px] truncate text-[10px] text-stone-400">{order.razorpayPaymentId}</p>}</td><td><Badge tone={orderTone(order.orderStatus)}>{order.orderStatus}</Badge>{order.cancellation?.status === "REQUESTED" && <p className="mt-1 text-xs font-bold text-red-700">Cancellation requested</p>}{order.returnRequests?.some((request) => request.status === "REQUESTED") && <p className="mt-1 text-xs font-bold text-amber-700">Return requested</p>}</td><td className="text-xs">{dateTime(order.createdAt)}</td><td className="text-right"><Button size="sm" variant="secondary" onClick={() => openOrder(order._id)}><Eye size={15} /> View</Button></td></tr>)}</tbody></table></div> : <EmptyState title="No orders match" description="Change the filters or wait for new customer orders." />}<Pagination page={pagination.page || page} pages={pagination.pages || 1} onChange={(nextPage) => { const next = new URLSearchParams(params); next.set("page", String(nextPage)); setParams(next); }} />
    </Card>

    <Modal open={Boolean(selected) || detailLoading} onClose={closeOrder} title={selected ? `Order ${selected.publicOrderNumber || compactId(selected._id)}` : "Loading order"} description={selected ? `${dateTime(selected.createdAt)} · ${selected.guestCheckout ? "Guest checkout" : "Registered customer"}` : ""} size="xl" footer={selected && <div className="flex flex-wrap justify-end gap-2"><Button variant="secondary" onClick={printInvoice}><Download size={16} /> Invoice</Button><Button variant="secondary" onClick={closeOrder}>Close</Button></div>}>
      {detailLoading || !selected ? <LoadingState label="Loading order details…" /> : <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-xl border border-stone-200 bg-white p-4"><p className="text-xs font-bold uppercase text-stone-500">Order status</p><div className="mt-2"><Badge tone={orderTone(selected.orderStatus)}>{selected.orderStatus}</Badge></div></div><div className="rounded-xl border border-stone-200 bg-white p-4"><p className="text-xs font-bold uppercase text-stone-500">Payment</p><div className="mt-2"><Badge tone={paymentTone(selected.paymentStatus)}>{selected.paymentStatus}</Badge></div><p className="mt-2 text-xs text-stone-500">{selected.paymentMethod}</p></div><div className="rounded-xl border border-stone-200 bg-white p-4"><p className="text-xs font-bold uppercase text-stone-500">Stock reservation</p><p className="mt-2 font-bold text-stone-950">{selected.stockReservationStatus || "NONE"}</p><p className="mt-1 text-xs text-stone-500">Expires {dateTime(selected.reservationExpiresAt)}</p></div><div className="rounded-xl border border-stone-200 bg-white p-4"><p className="text-xs font-bold uppercase text-stone-500">Total</p><p className="mt-2 text-xl font-bold text-brand-900">{currency(selected.totalPrice)}</p><p className="mt-1 text-xs text-stone-500">{selected.couponCode ? `Coupon ${selected.couponCode}` : "No coupon"}</p></div></div>

        <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]"><Card className="overflow-hidden shadow-none"><div className="border-b border-stone-200 px-4 py-3"><h3 className="font-bold text-stone-950">Ordered items</h3></div><div className="divide-y divide-stone-100">{(selected.items || []).map((item, index) => <div key={`${item._id || item.name}-${index}`} className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto]"><div><p className="font-bold text-stone-950">{item.name}</p><p className="text-xs text-stone-500">{item.itemType} · SKU {item.sku || "—"} · HSN {item.hsnCode || "—"} · GST {item.gstRate || 0}%</p></div><p className="text-sm font-bold">{item.quantity} × {currency(item.price)} = {currency(item.totalPrice)}</p></div>)}</div><div className="space-y-2 border-t border-stone-200 bg-stone-50 p-4 text-sm"><div className="flex justify-between"><span>Items</span><span>{currency(selected.itemsPrice)}</span></div><div className="flex justify-between"><span>Shipping</span><span>{currency(selected.shippingPrice)}</span></div><div className="flex justify-between text-emerald-800"><span>Coupon discount</span><span>-{currency(selected.couponDiscountAmount)}</span></div><div className="flex justify-between text-emerald-800"><span>Coin discount</span><span>-{currency(selected.amyekaDiscountAmount)}</span></div><div className="flex justify-between border-t border-stone-300 pt-2 font-bold text-stone-950"><span>Total</span><span>{currency(selected.totalPrice)}</span></div></div></Card>
        <div className="space-y-5"><Card className="p-4 shadow-none"><h3 className="font-bold text-stone-950">Customer and delivery</h3><p className="mt-3 text-sm font-bold">{selected.shippingAddress?.fullName}</p><p className="mt-1 text-xs leading-5 text-stone-600">{addressText(selected.shippingAddress)}</p><p className="mt-3 text-xs text-stone-600">{selected.shippingAddress?.phone}<br />{selected.shippingAddress?.email}</p></Card><Card className="p-4 shadow-none"><h3 className="font-bold text-stone-950">Tracking</h3><p className="mt-3 text-sm">{selected.tracking?.courierName || "Not assigned"}</p><p className="text-xs text-stone-500">{selected.tracking?.trackingNumber || "No tracking number"}</p>{selected.tracking?.trackingUrl && <a href={selected.tracking.trackingUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-bold text-brand-800 underline">Open courier tracking</a>}</Card></div></div>

        {selected.cancellation?.status === "REQUESTED" && <Card className="border-red-200 bg-red-50 p-4 shadow-none"><h3 className="font-bold text-red-950">Customer requested cancellation</h3><p className="mt-1 text-sm text-red-800">{selected.cancellation.reason || "No reason supplied"}</p><p className="mt-1 text-xs text-red-700">Use the order status control below to cancel and trigger the backend cancellation/refund workflow.</p></Card>}

        {(selected.returnRequests || []).length > 0 && <Card className="overflow-hidden shadow-none"><div className="border-b border-stone-200 px-4 py-3"><h3 className="font-bold text-stone-950">Return and replacement requests</h3></div><div className="divide-y divide-stone-100">{selected.returnRequests.map((request) => <div key={request._id} className="grid gap-3 p-4 lg:grid-cols-[1fr_auto]"><div><div className="flex flex-wrap items-center gap-2"><Badge tone={request.status === "REQUESTED" ? "warning" : request.status === "REJECTED" ? "danger" : request.status === "COMPLETED" ? "success" : "info"}>{request.status}</Badge><Badge>{request.type}</Badge><span className="text-xs text-stone-500">{dateTime(request.requestedAt)}</span></div><p className="mt-2 text-sm text-stone-800">{request.reason}</p>{request.adminNote && <p className="mt-1 text-xs text-stone-500">Admin note: {request.adminNote}</p>}</div>{["REQUESTED", "APPROVED"].includes(request.status) && <div className="flex flex-wrap gap-2">{request.status === "REQUESTED" && <><Button size="sm" variant="secondary" onClick={() => openReturnAction(request._id, "REJECTED")} disabled={saving}>Reject</Button><Button size="sm" onClick={() => openReturnAction(request._id, "APPROVED")} disabled={saving}>Approve</Button></>}{request.status === "APPROVED" && <Button size="sm" onClick={() => openReturnAction(request._id, "COMPLETED")} disabled={saving}><Undo2 size={15} /> Complete</Button>}</div>}</div>)}</div></Card>}

        <Card className="p-5 shadow-none"><h3 className="font-bold text-stone-950">Update fulfilment status</h3>{selected.paymentMethod === "ONLINE" && selected.paymentStatus !== "PAID" && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">Online orders should not progress beyond PLACED until payment is confirmed. The admin interface enforces this guard.</div>}<div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Next status"><Select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}><option value="">Select valid transition</option>{allowedTransitions.map((status) => <option key={status}>{status}</option>)}</Select></Field><Field label="Internal/customer note"><Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional status note" /></Field>{nextStatus === "SHIPPED" && <><Field label="Courier name" required><Input value={tracking.courierName} onChange={(event) => setTracking((current) => ({ ...current, courierName: event.target.value }))} /></Field><Field label="Tracking number" required><Input value={tracking.trackingNumber} onChange={(event) => setTracking((current) => ({ ...current, trackingNumber: event.target.value }))} /></Field><Field label="Tracking URL" className="md:col-span-2"><Input type="url" value={tracking.trackingUrl} onChange={(event) => setTracking((current) => ({ ...current, trackingUrl: event.target.value }))} /></Field></>}</div><div className="mt-4 flex justify-end"><Button onClick={updateStatus} disabled={!nextStatus || saving}>{nextStatus === "SHIPPED" ? <Truck size={16} /> : <PackageCheck size={16} />}{saving ? "Updating…" : "Update order"}</Button></div></Card>

        <Card className="overflow-hidden shadow-none"><div className="border-b border-stone-200 px-4 py-3"><h3 className="font-bold text-stone-950">Status history</h3></div><div className="divide-y divide-stone-100">{(selected.statusHistory || []).slice().reverse().map((entry, index) => <div key={`${entry.status}-${entry.changedAt}-${index}`} className="flex gap-3 px-4 py-3"><div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" /><div><p className="text-sm font-bold text-stone-900">{entry.status}</p><p className="text-xs text-stone-500">{entry.note || "No note"} · {dateTime(entry.changedAt)}</p></div></div>)}</div></Card>
      </div>}
    </Modal>
    <Modal open={Boolean(returnAction)} onClose={() => !saving && setReturnAction(null)} title={`${returnAction?.status === "REJECTED" ? "Reject" : returnAction?.status === "APPROVED" ? "Approve" : "Complete"} return request`} description={returnAction?.status === "COMPLETED" ? "Completing a return can trigger the backend refund and coin-reversal workflow." : "This decision becomes part of the permanent order record."} size="md" footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setReturnAction(null)} disabled={saving}>Cancel</Button><Button variant={returnAction?.status === "REJECTED" ? "danger" : "primary"} onClick={resolveReturn} disabled={saving}>{saving ? "Updating…" : `${returnAction?.status === "REJECTED" ? "Reject" : returnAction?.status === "APPROVED" ? "Approve" : "Complete"} request`}</Button></div>}>
      <Field label={returnAction?.status === "REJECTED" ? "Reason for rejection" : "Admin note"} required={returnAction?.status === "REJECTED"} hint="Use factual, support-ready wording. This is stored against the request."><Textarea rows="5" value={returnNote} onChange={(event) => setReturnNote(event.target.value)} placeholder="Add the decision note" /></Field>
    </Modal>
  </div>;
}
