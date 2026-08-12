import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Boxes, IndianRupee, Inbox, Package, RefreshCw, ShoppingBag, Users } from "lucide-react";
import { Link } from "react-router-dom";
import API, { assetUrl } from "../api/axios";
import { Badge, Button, Card, EmptyState, LoadingState, PageHeader, StatCard } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { currency, dateTime, orderTone, paymentTone } from "../utils/format";
import { getErrorMessage } from "../utils/errors";

export default function Dashboard() {
  const [state, setState] = useState({ summary: null, orders: [], products: [], enquiries: [], loading: true });
  const toast = useToast();

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true }));
    try {
      const [summary, orders, products, enquiries] = await Promise.all([
        API.get("/admin/dashboard"),
        API.get("/orders?limit=7"),
        API.get("/products/admin/all?limit=all&sort=newest"),
        API.get("/contact/admin?status=NEW&limit=5"),
      ]);
      setState({
        summary: summary.data.data || {},
        orders: orders.data.data || [],
        products: products.data.data || [],
        enquiries: enquiries.data.data || [],
        loading: false,
      });
    } catch (error) {
      setState((current) => ({ ...current, loading: false }));
      toast.error(getErrorMessage(error, "Dashboard data could not be loaded."));
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const lowStockProducts = useMemo(() => state.products.filter((product) => Number(product.stock || 0) <= Number(product.lowStockThreshold ?? 5)).slice(0, 6), [state.products]);
  const summary = state.summary || {};

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Live store operations"
        title="Dashboard"
        description="A concise view of sales, fulfilment pressure, inventory risk and customer follow-up across the Ameyka Veda store."
        actions={<><Link to="/orders"><Button variant="secondary"><ShoppingBag size={17} /> Open orders</Button></Link><Button onClick={load} disabled={state.loading}><RefreshCw size={17} className={state.loading ? "animate-spin" : ""} /> Refresh</Button></>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Paid revenue" value={currency(summary.paidRevenue)} note="Excludes cancelled and unpaid orders" icon={IndianRupee} />
        <StatCard label="Total orders" value={summary.orders || 0} note={`${summary.todayOrders || 0} received today`} icon={ShoppingBag} tone="info" />
        <StatCard label="Active products" value={summary.products || 0} note={`${summary.lowStock || 0} at or below threshold`} icon={Package} tone={summary.lowStock ? "warning" : "brand"} />
        <StatCard label="Active customers" value={summary.users || 0} note={`${summary.pendingContacts || 0} new enquiries`} icon={Users} tone="info" />
      </div>

      {(summary.lowStock > 0 || summary.pendingContacts > 0) && (
        <Card className="border-amber-200 bg-amber-50 p-4 shadow-none">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={21} /><div><p className="font-bold text-amber-950">Operational attention required</p><p className="mt-0.5 text-sm text-amber-800">{summary.lowStock || 0} low-stock products and {summary.pendingContacts || 0} unanswered customer enquiries need review.</p></div></div>
            <div className="flex gap-2"><Link to="/inventory"><Button variant="secondary" size="sm">Inventory</Button></Link><Link to="/enquiries"><Button variant="secondary" size="sm">Enquiries</Button></Link></div>
          </div>
        </Card>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.8fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4"><div><h2 className="font-bold text-stone-950">Recent orders</h2><p className="text-xs text-stone-500">Newest customer commitments requiring fulfilment</p></div><Link to="/orders" className="inline-flex items-center gap-1 text-xs font-bold text-brand-800 hover:text-brand-950">View all <ArrowRight size={14} /></Link></div>
          {state.loading ? <LoadingState label="Loading recent orders…" /> : state.orders.length ? (
            <div className="divide-y divide-stone-100">
              {state.orders.map((order) => <Link key={order._id} to={`/orders?open=${order._id}`} className="grid gap-3 px-5 py-4 transition hover:bg-brand-50/50 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div className="min-w-0"><p className="truncate text-sm font-bold text-stone-950">{order.publicOrderNumber || String(order._id).slice(-8)}</p><p className="mt-0.5 truncate text-xs text-stone-500">{order.shippingAddress?.fullName || order.user?.name || "Guest customer"} · {dateTime(order.createdAt)}</p></div><div className="flex flex-wrap gap-2"><Badge tone={orderTone(order.orderStatus)}>{order.orderStatus}</Badge><Badge tone={paymentTone(order.paymentStatus)}>{order.paymentStatus}</Badge></div><p className="font-bold text-stone-950">{currency(order.totalPrice)}</p></Link>)}
            </div>
          ) : <EmptyState title="No orders yet" description="New customer orders will appear here." />}
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4"><div><h2 className="font-bold text-stone-950">Inventory watch</h2><p className="text-xs text-stone-500">Out-of-stock and threshold alerts</p></div><Link to="/inventory" className="text-xs font-bold text-brand-800">Manage</Link></div>
          {state.loading ? <LoadingState label="Checking inventory…" /> : lowStockProducts.length ? <div className="divide-y divide-stone-100">{lowStockProducts.map((product) => <Link to="/inventory" key={product._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-brand-50/50"><div className="h-11 w-11 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">{product.images?.[0] ? <img src={assetUrl(product.images[0])} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-stone-400"><Boxes size={18} /></div>}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-stone-900">{product.name}</p><p className="text-xs text-stone-500">Threshold {product.lowStockThreshold ?? 5}</p></div><Badge tone={Number(product.stock) <= 0 ? "danger" : "warning"}>{Number(product.stock) <= 0 ? "Out" : `${product.stock} left`}</Badge></Link>)}</div> : <EmptyState title="Inventory looks healthy" description="No product is currently at or below its low-stock threshold." />}
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4"><div><h2 className="font-bold text-stone-950">New customer enquiries</h2><p className="text-xs text-stone-500">Leads and support requests from the storefront</p></div><Link to="/enquiries" className="text-xs font-bold text-brand-800">Open inbox</Link></div>
          {state.loading ? <LoadingState label="Loading enquiries…" /> : state.enquiries.length ? <div className="divide-y divide-stone-100">{state.enquiries.map((message) => <Link key={message._id} to="/enquiries" className="flex items-start gap-3 px-5 py-4 hover:bg-brand-50/50"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-copper-50 text-copper-700"><Inbox size={18} /></div><div className="min-w-0"><p className="truncate text-sm font-bold text-stone-950">{message.subject || "Product or order enquiry"}</p><p className="truncate text-xs text-stone-500">{message.name} · {message.email}</p><p className="mt-1 line-clamp-1 text-xs text-stone-600">{message.message}</p></div></Link>)}</div> : <EmptyState title="No new enquiries" description="New contact submissions will appear here." />}
        </Card>
        <Card className="p-5">
          <h2 className="font-bold text-stone-950">Quick actions</h2><p className="mt-1 text-xs text-stone-500">Common tasks for day-to-day store operations</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[ ["Add or edit products", "/products", Package], ["Update available stock", "/inventory", Boxes], ["Create a coupon", "/promotions", IndianRupee], ["Review delivery rules", "/delivery", ShoppingBag] ].map(([label, path, Icon]) => <Link key={path} to={path} className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm font-bold text-stone-800 transition hover:border-brand-300 hover:bg-brand-50"><Icon size={19} className="text-brand-700" />{label}<ArrowRight size={15} className="ml-auto text-stone-400" /></Link>)}
          </div>
        </Card>
      </div>
    </div>
  );
}
