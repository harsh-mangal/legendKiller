import { useCallback, useEffect, useMemo, useState } from "react";
import { BadgePercent, CalendarDays, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import API from "../api/axios";
import { Badge, Button, Card, ConfirmDialog, EmptyState, Field, Input, LoadingState, Modal, PageHeader, Select, Textarea, Toggle } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { currency, dateOnly } from "../utils/format";
import { getErrorMessage } from "../utils/errors";
import { couponCodeIsValid, endOfInputDateIso, isFiniteNumber, isWholeNumber, startOfInputDateIso } from "../utils/validation";

const blank = {
  code: "", description: "", discountType: "PERCENTAGE", discountValue: "", maxDiscount: "", minOrderValue: "0",
  startsAt: "", endsAt: "", usageLimit: "", perUserLimit: "1", eligibleProducts: [], eligibleCategories: [], isActive: true,
};

const toInputDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function Promotions() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [promotions, productRes, categoryRes] = await Promise.all([
        API.get("/promotions/admin"),
        API.get("/products/admin/all?limit=all"),
        API.get("/categories/admin/all"),
      ]);
      setItems(promotions.data.data || []);
      setProducts(productRes.data.data || []);
      setCategories(categoryRes.data.data || []);
    } catch (error) { toast.error(getErrorMessage(error, "Coupons could not be loaded.")); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return items.filter((item) => !keyword || item.code?.toLowerCase().includes(keyword) || item.description?.toLowerCase().includes(keyword));
  }, [items, search]);

  const openCreate = () => { setEditingId(""); setForm(blank); setEditorOpen(true); };
  const openEdit = (item) => {
    setEditingId(item._id);
    setForm({
      code: item.code || "", description: item.description || "", discountType: item.discountType || "PERCENTAGE",
      discountValue: String(item.discountValue ?? ""), maxDiscount: item.maxDiscount == null ? "" : String(item.maxDiscount),
      minOrderValue: String(item.minOrderValue ?? 0), startsAt: toInputDate(item.startsAt), endsAt: toInputDate(item.endsAt),
      usageLimit: item.usageLimit == null ? "" : String(item.usageLimit), perUserLimit: String(item.perUserLimit ?? 1),
      eligibleProducts: (item.eligibleProducts || []).map((value) => value._id || value),
      eligibleCategories: (item.eligibleCategories || []).map((value) => value._id || value), isActive: item.isActive !== false,
    });
    setEditorOpen(true);
  };

  const submit = async () => {
    const code = form.code.trim().toUpperCase();
    const discountValue = Number(form.discountValue);
    const maxDiscount = form.maxDiscount === "" ? null : Number(form.maxDiscount);
    const minOrderValue = Number(form.minOrderValue || 0);
    const usageLimit = form.usageLimit === "" ? null : Number(form.usageLimit);
    const perUserLimit = Number(form.perUserLimit || 1);

    if (!couponCodeIsValid(code)) { toast.error("Use 3–32 characters: letters, numbers, hyphens or underscores."); return; }
    if (!isFiniteNumber(form.discountValue) || discountValue <= 0) { toast.error("Discount value must be greater than zero."); return; }
    if (form.discountType === "PERCENTAGE" && discountValue > 100) { toast.error("A percentage coupon cannot exceed 100%."); return; }
    if (maxDiscount !== null && (!Number.isFinite(maxDiscount) || maxDiscount < 0)) { toast.error("Maximum discount cannot be negative."); return; }
    if (!Number.isFinite(minOrderValue) || minOrderValue < 0) { toast.error("Minimum order value cannot be negative."); return; }
    if (usageLimit !== null && (!isWholeNumber(usageLimit) || usageLimit < 1)) { toast.error("Total usage limit must be a positive whole number or left blank."); return; }
    if (!isWholeNumber(perUserLimit) || perUserLimit < 1) { toast.error("Per-customer limit must be a positive whole number."); return; }
    if (usageLimit !== null && perUserLimit > usageLimit) { toast.error("Per-customer limit cannot exceed the total usage limit."); return; }
    if (form.description.trim().length > 250) { toast.error("Internal description cannot exceed 250 characters."); return; }
    if (form.startsAt && form.endsAt && new Date(`${form.endsAt}T23:59:59.999`) < new Date(`${form.startsAt}T00:00:00.000`)) { toast.error("Coupon end date cannot be before its start date."); return; }

    try {
      setSaving(true);
      const payload = {
        ...form,
        code,
        description: form.description.trim(),
        discountValue,
        maxDiscount: form.discountType === "PERCENTAGE" ? maxDiscount : null,
        minOrderValue,
        usageLimit,
        perUserLimit,
        startsAt: startOfInputDateIso(form.startsAt),
        endsAt: endOfInputDateIso(form.endsAt),
      };
      const { data } = editingId ? await API.put(`/promotions/admin/${editingId}`, payload) : await API.post("/promotions/admin", payload);
      setItems((current) => editingId ? current.map((item) => item._id === editingId ? data.data : item) : [data.data, ...current]);
      toast.success(data.message || "Coupon saved.");
      setEditorOpen(false);
    } catch (error) { toast.error(getErrorMessage(error, "Coupon could not be saved.")); }
    finally { setSaving(false); }
  };

  const disable = async () => {
    if (!deleteTarget) return;
    try { setSaving(true); const { data } = await API.delete(`/promotions/admin/${deleteTarget._id}`); setItems((current) => current.map((item) => item._id === deleteTarget._id ? data.data : item)); toast.success(data.message || "Coupon disabled."); setDeleteTarget(null); }
    catch (error) { toast.error(getErrorMessage(error, "Coupon could not be disabled.")); }
    finally { setSaving(false); }
  };

  const statusFor = (item) => {
    const now = new Date();
    if (!item.isActive) return ["Disabled", "neutral"];
    if (item.startsAt && new Date(item.startsAt) > now) return ["Scheduled", "info"];
    if (item.endsAt && new Date(item.endsAt) < now) return ["Expired", "danger"];
    if (item.usageLimit != null && Number(item.usageCount || 0) >= Number(item.usageLimit)) return ["Limit reached", "warning"];
    return ["Active", "success"];
  };

  return <div className="space-y-6">
    <PageHeader eyebrow="Sales promotions" title="Coupons" description="Create server-validated discount codes. Eligible products and categories use the same records shown on the customer storefront." actions={<><Button variant="secondary" onClick={load}><RefreshCw size={17} /> Refresh</Button><Button onClick={openCreate}><Plus size={17} /> New coupon</Button></>} />
    <Card className="overflow-hidden">
      <div className="border-b border-stone-200 p-4"><div className="relative max-w-md"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" /><Input className="pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search coupon code or description" /></div></div>
      {loading ? <LoadingState label="Loading coupons…" /> : visible.length ? <div className="table-wrap"><table className="data-table min-w-[1050px]"><thead><tr><th>Code</th><th>Offer</th><th>Minimum order</th><th>Validity</th><th>Usage</th><th>Status</th><th className="text-right">Actions</th></tr></thead><tbody>{visible.map((item) => { const [label, tone] = statusFor(item); return <tr key={item._id}><td><p className="font-black tracking-wider text-brand-900">{item.code}</p><p className="mt-1 max-w-xs text-xs text-stone-500">{item.description || "No internal description"}</p></td><td><p className="font-bold text-stone-950">{item.discountType === "PERCENTAGE" ? `${item.discountValue}% off` : `${currency(item.discountValue)} off`}</p>{item.maxDiscount != null && <p className="text-xs text-stone-500">Maximum {currency(item.maxDiscount)}</p>}</td><td>{currency(item.minOrderValue || 0)}</td><td><div className="flex items-center gap-1.5 text-xs"><CalendarDays size={14} className="text-stone-400" />{dateOnly(item.startsAt)} – {dateOnly(item.endsAt)}</div></td><td><p className="font-bold text-stone-950">{item.usageCount || 0}{item.usageLimit != null ? ` / ${item.usageLimit}` : ""}</p><p className="text-xs text-stone-500">{item.perUserLimit || 1} per customer</p></td><td><Badge tone={tone}>{label}</Badge></td><td className="text-right"><div className="inline-flex gap-2"><Button size="sm" variant="secondary" onClick={() => openEdit(item)}><Pencil size={15} /> Edit</Button>{item.isActive !== false && <Button size="sm" variant="danger" onClick={() => setDeleteTarget(item)}><Trash2 size={15} /></Button>}</div></td></tr>; })}</tbody></table></div> : <EmptyState icon={BadgePercent} title="No coupons created" description="Create the first code when you have a real promotion to run." action={<Button onClick={openCreate}><Plus size={17} /> New coupon</Button>} />}
    </Card>

    <Modal open={editorOpen} onClose={() => setEditorOpen(false)} title={editingId ? "Edit coupon" : "Create coupon"} description="Discounts are recalculated by the server during checkout." size="xl" footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setEditorOpen(false)}>Cancel</Button><Button onClick={submit} disabled={saving}>{saving ? "Saving…" : editingId ? "Update coupon" : "Create coupon"}</Button></div>}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Coupon code" required><Input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase().replace(/\s+/g, "") }))} placeholder="WELCOME10" /></Field>
        <Field label="Discount type" required><Select value={form.discountType} onChange={(event) => setForm((current) => ({ ...current, discountType: event.target.value }))}><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed rupee amount</option></Select></Field>
        <Field label="Discount value" required hint={form.discountType === "PERCENTAGE" ? "Maximum 100%." : "Amount in rupees."}><Input type="number" min="0" step="0.01" value={form.discountValue} onChange={(event) => setForm((current) => ({ ...current, discountValue: event.target.value }))} /></Field>
        <Field label="Maximum discount" hint="Useful for percentage coupons. Leave blank for no cap."><Input type="number" min="0" step="0.01" value={form.maxDiscount} onChange={(event) => setForm((current) => ({ ...current, maxDiscount: event.target.value }))} /></Field>
        <Field label="Minimum order value"><Input type="number" min="0" step="0.01" value={form.minOrderValue} onChange={(event) => setForm((current) => ({ ...current, minOrderValue: event.target.value }))} /></Field>
        <Field label="Per-customer limit"><Input type="number" min="1" step="1" value={form.perUserLimit} onChange={(event) => setForm((current) => ({ ...current, perUserLimit: event.target.value }))} /></Field>
        <Field label="Start date"><Input type="date" value={form.startsAt} onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))} /></Field>
        <Field label="End date"><Input type="date" value={form.endsAt} onChange={(event) => setForm((current) => ({ ...current, endsAt: event.target.value }))} /></Field>
        <Field label="Total usage limit" hint="Leave blank for unlimited redemptions."><Input type="number" min="0" step="1" value={form.usageLimit} onChange={(event) => setForm((current) => ({ ...current, usageLimit: event.target.value }))} /></Field>
        <Field label="Status"><Toggle checked={form.isActive} onChange={(value) => setForm((current) => ({ ...current, isActive: value }))} label={form.isActive ? "Coupon active" : "Coupon disabled"} description="Disabled codes cannot be applied at checkout." /></Field>
        <Field label="Internal description" className="md:col-span-2" hint={`${form.description.length}/250 characters`}><Textarea maxLength="250" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="What campaign is this coupon for?" /></Field>
        <Field label="Eligible products" hint="Leave empty to allow all products."><select multiple className="input min-h-44" value={form.eligibleProducts} onChange={(event) => setForm((current) => ({ ...current, eligibleProducts: Array.from(event.target.selectedOptions, (option) => option.value) }))}>{products.filter((product) => product.isActive !== false).map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}</select></Field>
        <Field label="Eligible categories" hint="Leave empty to allow all categories."><select multiple className="input min-h-44" value={form.eligibleCategories} onChange={(event) => setForm((current) => ({ ...current, eligibleCategories: Array.from(event.target.selectedOptions, (option) => option.value) }))}>{categories.filter((category) => category.isActive !== false).map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></Field>
      </div>
    </Modal>
    <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={disable} loading={saving} dangerous title="Disable coupon" confirmLabel="Disable coupon" description={`Disable ${deleteTarget?.code}? Existing orders remain unchanged, but the code will stop working for new checkouts.`} />
  </div>;
}
