import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Boxes, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import API, { assetUrl } from "../api/axios";
import { Badge, Button, Card, ConfirmDialog, EmptyState, Field, Input, LoadingState, Modal, PageHeader, Select, Textarea, Toggle } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { currency } from "../utils/format";
import { getErrorMessage } from "../utils/errors";
import { isFiniteNumber, isWholeNumber, validateImageFiles } from "../utils/validation";
import { useObjectUrls } from "../hooks/useObjectUrl";

const blank = { name: "", slug: "", shortDescription: "", description: "", price: "", mrp: "", isFeatured: false, isActive: true, images: [], products: [] };
const selectedFrom = (combo) => (combo.products || []).map((item) => ({ product: item.product?._id || item.product, quantity: String(item.quantity || 1) }));

export default function Combos() {
  const [items, setItems] = useState([]); const [products, setProducts] = useState([]); const [loading, setLoading] = useState(true); const [editorOpen, setEditorOpen] = useState(false); const [editingId, setEditingId] = useState(""); const [form, setForm] = useState(blank); const [existingImages, setExistingImages] = useState([]); const [saving, setSaving] = useState(false); const [archiveTarget, setArchiveTarget] = useState(null); const toast = useToast();
  const load = useCallback(async () => { try { setLoading(true); const [comboRes, productRes] = await Promise.all([API.get("/combos/admin/all"), API.get("/products/admin/all?limit=all")]); setItems(comboRes.data.data || []); setProducts(productRes.data.data || []); } catch (error) { toast.error(getErrorMessage(error, "Combos could not be loaded.")); } finally { setLoading(false); } }, [toast]);
  useEffect(() => { load(); }, [load]);
  const productMap = useMemo(() => new Map(products.map((product) => [String(product._id), product])), [products]);
  const imagePreviews = useObjectUrls(form.images);
  const calculatedMrp = useMemo(() => form.products.reduce((sum, row) => sum + Number(productMap.get(String(row.product))?.price || 0) * Number(row.quantity || 1), 0), [form.products, productMap]);
  const openCreate = () => { setEditingId(""); setForm(blank); setExistingImages([]); setEditorOpen(true); };
  const openEdit = (item) => { setEditingId(item._id); setExistingImages(item.images || []); setForm({ ...blank, ...item, price: String(item.price ?? ""), mrp: String(item.mrp ?? ""), products: selectedFrom(item), images: [] }); setEditorOpen(true); };
  const addRow = () => { const available = products.find((product) => product.isActive !== false && !form.products.some((row) => String(row.product) === String(product._id))); if (!available) { toast.info("Every active product is already selected."); return; } setForm((current) => ({ ...current, products: [...current.products, { product: available._id, quantity: "1" }] })); };
  const updateRow = (index, patch) => setForm((current) => ({ ...current, products: current.products.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row) }));
  const submit = async () => {
    const price = form.price === "" ? calculatedMrp : Number(form.price);
    const mrp = form.mrp === "" ? calculatedMrp : Number(form.mrp);
    const selectedIds = form.products.map((row) => String(row.product || "")).filter(Boolean);
    if (!form.name.trim() || !form.products.length) { toast.error("Combo name and at least one product are required."); return; }
    if (new Set(selectedIds).size !== selectedIds.length) { toast.error("A product cannot appear more than once in the same combo."); return; }
    if (form.products.some((row) => !row.product || !isWholeNumber(row.quantity) || Number(row.quantity) < 1)) { toast.error("Every combo product needs a positive whole-number quantity."); return; }
    if (form.products.some((row) => !productMap.get(String(row.product)))) { toast.error("One or more selected products no longer exist. Reload the catalogue and try again."); return; }
    if (!isFiniteNumber(price) || price <= 0 || !isFiniteNumber(mrp) || mrp <= 0) { toast.error("Combo price and MRP must be greater than zero."); return; }
    if (mrp < price) { toast.error("Combo MRP cannot be lower than its selling price."); return; }
    if (!editingId && !form.images.length) { toast.error("Upload at least one combo image."); return; }
    const imageError = validateImageFiles(form.images);
    if (imageError) { toast.error(imageError); return; }
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("slug", form.slug.trim());
      fd.append("shortDescription", form.shortDescription.trim());
      fd.append("description", form.description.trim());
      fd.append("price", String(price));
      fd.append("mrp", String(mrp));
      fd.append("isFeatured", String(form.isFeatured));
      fd.append("isActive", String(form.isActive));
      fd.append("products", JSON.stringify(form.products.map((row) => ({ product: row.product, quantity: Number(row.quantity) }))));
      form.images.forEach((file) => fd.append("images", file));
      const { data } = editingId ? await API.put(`/combos/${editingId}`, fd) : await API.post("/combos", fd);
      setItems((current) => editingId ? current.map((item) => item._id === editingId ? data.data : item) : [data.data, ...current]);
      toast.success(data.message || "Combo saved.");
      setEditorOpen(false);
    } catch (error) { toast.error(getErrorMessage(error, "Combo could not be saved.")); }
    finally { setSaving(false); }
  };
  const archive = async () => { if (!archiveTarget) return; try { setSaving(true); const { data } = await API.delete(`/combos/${archiveTarget._id}`); setItems((current) => current.map((item) => item._id === archiveTarget._id ? { ...item, isActive: false } : item)); toast.success(data.message || "Combo archived."); setArchiveTarget(null); } catch (error) { toast.error(getErrorMessage(error, "Combo could not be archived.")); } finally { setSaving(false); } };
  return <div className="space-y-6"><PageHeader eyebrow="Bundled offers" title="Product combos" description="Build fixed bundles from active products. Combo stock is calculated from the lowest available component quantity on the backend." actions={<><Button variant="secondary" onClick={load}><RefreshCw size={17} /> Refresh</Button><Button onClick={openCreate}><Plus size={17} /> Add combo</Button></>} />
    <Card className="overflow-hidden">{loading ? <LoadingState label="Loading combos…" /> : items.length ? <div className="grid gap-0 lg:grid-cols-2">{items.map((item) => <article key={item._id} className="border-b border-stone-100 p-5 lg:border-r"><div className="flex gap-4"><div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">{item.images?.[0] ? <img src={assetUrl(item.images[0])} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-stone-400"><Boxes size={25} /></div>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-stone-950">{item.name}</h2><Badge tone={item.isActive !== false ? "success" : "neutral"}>{item.isActive !== false ? "Active" : "Inactive"}</Badge>{item.isFeatured && <Badge tone="warning">Featured</Badge>}</div><p className="mt-1 text-xs text-stone-500">{currency(item.price)} · MRP {currency(item.mrp)} · {item.availableStock ?? 0} combo(s) available</p><p className="mt-2 line-clamp-2 text-xs leading-5 text-stone-600">{(item.products || []).map((row) => `${row.product?.name || "Product"} × ${row.quantity}`).join(" · ")}</p></div></div><div className="mt-4 flex justify-end gap-2"><Button size="sm" variant="secondary" onClick={() => openEdit(item)}><Pencil size={15} /> Edit</Button>{item.isActive !== false && <Button size="sm" variant="danger" onClick={() => setArchiveTarget(item)}><Archive size={15} /></Button>}</div></article>)}</div> : <EmptyState icon={Boxes} title="No combos created" description="Create bundles only after individual products and stock are ready." action={<Button onClick={openCreate}><Plus size={17} /> Add combo</Button>} />}</Card>
    <Modal open={editorOpen} onClose={() => setEditorOpen(false)} title={editingId ? "Edit combo" : "Add combo"} size="xl" footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setEditorOpen(false)}>Cancel</Button><Button onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save combo"}</Button></div>}><div className="grid gap-5 md:grid-cols-2"><Field label="Combo name" required><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></Field><Field label="Slug"><Input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} /></Field><Field label="Short description" className="md:col-span-2"><Textarea rows="3" value={form.shortDescription} onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))} /></Field><Field label="Full description" className="md:col-span-2"><Textarea rows="5" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></Field><Field label="Selling price" hint={`Calculated component value: ${currency(calculatedMrp)}`}><Input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} /></Field><Field label="Combo MRP"><Input type="number" min="0" step="0.01" value={form.mrp} onChange={(event) => setForm((current) => ({ ...current, mrp: event.target.value }))} placeholder={String(calculatedMrp)} /></Field><Field label="Images" className="md:col-span-2" hint={editingId ? "New images replace the current combo images." : "Maximum 6 images."}><Input type="file" accept="image/*" multiple onChange={(event) => setForm((current) => ({ ...current, images: Array.from(event.target.files || []).slice(0, 6) }))} /></Field>{(form.images.length || existingImages.length) > 0 && <div className="md:col-span-2 flex flex-wrap gap-3">{(imagePreviews.length ? imagePreviews : existingImages.map(assetUrl)).map((url) => <img key={url} src={url} alt="Combo preview" className="h-20 w-20 rounded-xl border object-cover" />)}</div>}<div className="md:col-span-2 rounded-xl border border-stone-200 bg-stone-50 p-4"><div className="flex items-center justify-between"><div><h3 className="font-bold text-stone-950">Included products</h3><p className="text-xs text-stone-500">A product cannot appear twice in the same combo.</p></div><Button size="sm" variant="secondary" onClick={addRow}><Plus size={15} /> Add product</Button></div><div className="mt-4 space-y-3">{form.products.map((row, index) => <div key={`${row.product}-${index}`} className="grid gap-2 sm:grid-cols-[1fr_110px_42px]"><Select value={row.product} onChange={(event) => updateRow(index, { product: event.target.value })}>{products.filter((product) => product.isActive !== false || String(product._id) === String(row.product)).map((product) => <option key={product._id} value={product._id}>{product.name} · {currency(product.price)} · Stock {product.stock}</option>)}</Select><Input type="number" min="1" step="1" value={row.quantity} onChange={(event) => updateRow(index, { quantity: event.target.value })} /><button type="button" className="icon-btn text-red-700" onClick={() => setForm((current) => ({ ...current, products: current.products.filter((_, rowIndex) => rowIndex !== index) }))} aria-label="Remove product"><Trash2 size={17} /></button></div>)}{!form.products.length && <p className="py-6 text-center text-sm text-stone-500">No products selected.</p>}</div></div><Toggle checked={form.isActive} onChange={(value) => setForm((current) => ({ ...current, isActive: value }))} label="Visible on storefront" /><Toggle checked={form.isFeatured} onChange={(value) => setForm((current) => ({ ...current, isFeatured: value }))} label="Featured combo" /></div></Modal>
    <ConfirmDialog open={Boolean(archiveTarget)} onClose={() => setArchiveTarget(null)} onConfirm={archive} loading={saving} dangerous title="Archive combo" confirmLabel="Archive combo" description={`Archive ${archiveTarget?.name}? It will no longer be available to customers.`} />
  </div>;
}
