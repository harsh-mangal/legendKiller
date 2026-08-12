import { useCallback, useEffect, useMemo, useState } from "react";
import { ArchiveRestore, Boxes, PackageSearch, RefreshCw, Save, Search, TriangleAlert } from "lucide-react";
import API, { assetUrl } from "../api/axios";
import { Badge, Button, Card, EmptyState, Input, LoadingState, PageHeader, StatCard } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/errors";

const statusOf = (product) => {
  if (product.isActive === false) return "INACTIVE";
  if (Number(product.stock || 0) <= 0) return "OUT";
  if (Number(product.stock || 0) <= Number(product.lowStockThreshold ?? 5)) return "LOW";
  return "HEALTHY";
};

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/products/admin/all?limit=all&sort=newest");
      const list = data.data || [];
      setProducts(list);
      setDrafts(Object.fromEntries(list.map((product) => [product._id, { stock: String(product.stock ?? 0), lowStockThreshold: String(product.lowStockThreshold ?? 5), isActive: product.isActive !== false }])));
    } catch (error) {
      toast.error(getErrorMessage(error, "Inventory could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => products.reduce((acc, product) => { acc.total += 1; acc[statusOf(product)] += 1; return acc; }, { total: 0, HEALTHY: 0, LOW: 0, OUT: 0, INACTIVE: 0 }), [products]);
  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => (filter === "ALL" || statusOf(product) === filter) && (!keyword || product.name?.toLowerCase().includes(keyword) || product.sku?.toLowerCase().includes(keyword) || product.category?.name?.toLowerCase().includes(keyword)));
  }, [products, search, filter]);

  const patchDraft = (id, patch) => setDrafts((current) => ({ ...current, [id]: { ...current[id], ...patch } }));

  const save = async (product) => {
    const draft = drafts[product._id];
    const stock = Number(draft.stock);
    const threshold = Number(draft.lowStockThreshold);
    if (!Number.isInteger(stock) || stock < 0 || !Number.isFinite(threshold) || threshold < 0) {
      toast.error("Stock must be a whole number and thresholds cannot be negative.");
      return;
    }
    try {
      setSavingId(product._id);
      const { data } = await API.put(`/products/${product._id}`, { stock, lowStockThreshold: threshold, isActive: draft.isActive });
      setProducts((current) => current.map((item) => item._id === product._id ? data.data : item));
      toast.success(`${product.name} inventory updated.`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Inventory update failed."));
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Stock control" title="Inventory" description="Update saleable stock, alert thresholds and catalogue availability without opening the full product editor." actions={<Button variant="secondary" onClick={load} disabled={loading}><RefreshCw size={17} className={loading ? "animate-spin" : ""} /> Refresh</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products tracked" value={stats.total} icon={Boxes} />
        <StatCard label="Low stock" value={stats.LOW} note="At or below alert threshold" icon={TriangleAlert} tone="warning" />
        <StatCard label="Out of stock" value={stats.OUT} note="Cannot be purchased" icon={PackageSearch} tone="danger" />
        <StatCard label="Inactive" value={stats.INACTIVE} note="Hidden from the storefront" icon={ArchiveRestore} tone="info" />
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-stone-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" /><Input className="pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by product, SKU or category" /></div>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">{[ ["ALL", "All"], ["LOW", "Low stock"], ["OUT", "Out of stock"], ["HEALTHY", "Healthy"], ["INACTIVE", "Inactive"] ].map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition ${filter === value ? "bg-brand-800 text-white" : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"}`}>{label}</button>)}</div>
        </div>
        {loading ? <LoadingState label="Loading inventory…" /> : visible.length ? (
          <div className="table-wrap"><table className="data-table min-w-[980px]"><thead><tr><th>Product</th><th>Current status</th><th className="w-36">Available stock</th><th className="w-40">Low-stock alert</th><th className="w-28">Visible</th><th className="w-28 text-right">Save</th></tr></thead><tbody>{visible.map((product) => {
            const draft = drafts[product._id] || {};
            const status = statusOf({ ...product, ...draft, stock: Number(draft.stock), lowStockThreshold: Number(draft.lowStockThreshold), isActive: draft.isActive });
            const tone = status === "HEALTHY" ? "success" : status === "LOW" ? "warning" : status === "OUT" ? "danger" : "neutral";
            return <tr key={product._id}><td><div className="flex items-center gap-3"><div className="h-12 w-12 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">{product.images?.[0] ? <img src={assetUrl(product.images[0])} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-stone-400"><Boxes size={18} /></div>}</div><div className="min-w-0"><p className="max-w-xs truncate font-bold text-stone-950">{product.name}</p><p className="text-xs text-stone-500">{product.sku || "No SKU"} · {product.category?.name || "Uncategorised"}</p></div></div></td><td><Badge tone={tone}>{status.replace("_", " ")}</Badge></td><td><Input type="number" min="0" step="1" value={draft.stock ?? ""} onChange={(event) => patchDraft(product._id, { stock: event.target.value })} /></td><td><Input type="number" min="0" step="1" value={draft.lowStockThreshold ?? ""} onChange={(event) => patchDraft(product._id, { lowStockThreshold: event.target.value })} /></td><td><button type="button" onClick={() => patchDraft(product._id, { isActive: !draft.isActive })} className={`rounded-full px-3 py-1.5 text-xs font-bold ${draft.isActive ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-600"}`}>{draft.isActive ? "Active" : "Hidden"}</button></td><td className="text-right"><Button size="sm" onClick={() => save(product)} disabled={savingId === product._id}><Save size={15} />{savingId === product._id ? "Saving" : "Save"}</Button></td></tr>;
          })}</tbody></table></div>
        ) : <EmptyState title="No inventory rows match" description="Change the search or stock filter to see more products." />}
      </Card>
    </div>
  );
}
