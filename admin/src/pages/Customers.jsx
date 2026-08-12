import { useCallback, useEffect, useMemo, useState } from "react";
import { Ban, Download, Mail, RefreshCw, Search, ShieldCheck, ShoppingBag, ShoppingCart, UserRoundCheck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { Badge, Button, Card, ConfirmDialog, EmptyState, Input, LoadingState, PageHeader, StatCard } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { currency, dateTime } from "../utils/format";
import { getErrorMessage } from "../utils/errors";
import { downloadCsv } from "../utils/csv";

export default function Customers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [target, setTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try { setLoading(true); const { data } = await API.get("/admin/users-wallet-cart"); setUsers(data.data || []); }
    catch (error) { toast.error(getErrorMessage(error, "Customers could not be loaded.")); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => ({ total: users.filter((user) => user.role !== "ADMIN").length, blocked: users.filter((user) => user.isBlocked).length, buyers: users.filter((user) => Number(user.totalOrders || 0) > 0).length, carts: users.reduce((sum, user) => sum + Number(user.cartItems || 0), 0) }), [users]);
  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return users.filter((user) => {
      if (user.role === "ADMIN") return false;
      const matchesFilter =
        filter === "ALL" ||
        (filter === "BLOCKED" && user.isBlocked) ||
        (filter === "BUYERS" && Number(user.totalOrders || 0) > 0) ||
        (filter === "CARTS" && Number(user.cartItems || 0) > 0);
      const matchesSearch = !keyword || [user.name, user.email, user.phone]
        .some((value) => String(value || "").toLowerCase().includes(keyword));
      return matchesFilter && matchesSearch;
    });
  }, [users, search, filter]);

  const toggleBlock = async () => {
    if (!target) return;
    try {
      setSaving(true);
      const { data } = await API.patch(`/admin/users/${target._id}/block`, { isBlocked: !target.isBlocked });
      setUsers((current) => current.map((user) => user._id === target._id ? { ...user, ...data.data } : user));
      toast.success(data.message || "Customer status updated.");
      setTarget(null);
    } catch (error) { toast.error(getErrorMessage(error, "Customer status could not be updated.")); }
    finally { setSaving(false); }
  };

  return <div className="space-y-6">
    <PageHeader eyebrow="Customer operations" title="Customers" description="Review customer value, contact information, stored coin balance and active carts. Blocking is intended for fraud, abuse or support-approved account restrictions." actions={<><Button variant="secondary" onClick={() => downloadCsv("ameyka-customers.csv", visible, [{ label: "Name", value: "name" }, { label: "Email", value: "email" }, { label: "Phone", value: "phone" }, { label: "Orders", value: "totalOrders" }, { label: "Recorded order value", value: "totalSpent" }, { label: "Coins", value: "amyekaCoins" }, { label: "Cart items", value: "cartItems" }, { label: "Blocked", value: (item) => item.isBlocked ? "Yes" : "No" }, { label: "Joined", value: "createdAt" }])} disabled={!visible.length}><Download size={17} /> Export</Button><Button variant="secondary" onClick={load}><RefreshCw size={17} /> Refresh</Button></>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Customer accounts" value={stats.total} icon={Users} /><StatCard label="Customers with orders" value={stats.buyers} icon={UserRoundCheck} tone="info" /><StatCard label="Items in saved carts" value={stats.carts} icon={ShoppingCart} tone="warning" /><StatCard label="Blocked accounts" value={stats.blocked} icon={Ban} tone={stats.blocked ? "danger" : "brand"} /></div>
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-stone-200 p-4 lg:flex-row lg:items-center lg:justify-between"><div className="relative w-full max-w-md"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" /><Input className="pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email or mobile" /></div><div className="flex gap-2">{[ ["ALL", "All"], ["BUYERS", "Buyers"], ["CARTS", "Active carts"], ["BLOCKED", "Blocked"] ].map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-xl px-3 py-2 text-xs font-bold ${filter === value ? "bg-brand-800 text-white" : "border border-stone-200 bg-white text-stone-600"}`}>{label}</button>)}</div></div>
      {loading ? <LoadingState label="Loading customer accounts…" /> : visible.length ? <div className="table-wrap"><table className="data-table min-w-[1050px]"><thead><tr><th>Customer</th><th>Contact</th><th>Last login</th><th>Orders</th><th>Recorded order value</th><th>Coins</th><th>Cart</th><th>Status</th><th className="text-right">Action</th></tr></thead><tbody>{visible.map((user) => <tr key={user._id}><td><p className="font-bold text-stone-950">{user.name || "Customer"}</p><p className="text-xs text-stone-500">Joined {dateTime(user.createdAt)}</p></td><td><p className="flex items-center gap-1.5"><Mail size={14} className="text-stone-400" />{user.email}</p><p className="mt-1 text-xs text-stone-500">{user.phone || "No mobile number"}</p></td><td>{dateTime(user.lastLoginAt)}</td><td className="font-bold text-stone-950">{user.totalOrders || 0}</td><td className="font-bold text-brand-800">{currency(user.totalSpent)}</td><td><Badge tone="warning">{user.amyekaCoins || 0}</Badge></td><td>{user.cartItems || 0} item(s)</td><td><Badge tone={user.isBlocked ? "danger" : "success"}>{user.isBlocked ? "Blocked" : "Active"}</Badge></td><td className="text-right"><div className="inline-flex gap-2"><Button size="sm" variant="secondary" onClick={() => navigate(`/orders?search=${encodeURIComponent(user.email || user.phone || user._id)}`)} disabled={!Number(user.totalOrders || 0)}><ShoppingBag size={15} /> Orders</Button><Button size="sm" variant={user.isBlocked ? "secondary" : "danger"} onClick={() => setTarget(user)}>{user.isBlocked ? <ShieldCheck size={15} /> : <Ban size={15} />}{user.isBlocked ? "Unblock" : "Block"}</Button></div></td></tr>)}</tbody></table></div> : <EmptyState title="No customers match" description="Try a different filter or search term." />}
    </Card>
    <ConfirmDialog open={Boolean(target)} onClose={() => setTarget(null)} onConfirm={toggleBlock} loading={saving} dangerous={!target?.isBlocked} title={target?.isBlocked ? "Unblock customer account" : "Block customer account"} confirmLabel={target?.isBlocked ? "Unblock account" : "Block account"} description={target?.isBlocked ? `Restore access for ${target?.name || target?.email}?` : `Block ${target?.name || target?.email}? They will be unable to sign in or place authenticated orders until access is restored.`} />
  </div>;
}
