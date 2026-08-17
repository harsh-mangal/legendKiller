import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Copy, Download, ExternalLink, Eye, Film, ImagePlus, Pencil, Plus, QrCode, RefreshCw, Search, ShieldCheck, Star, Trash2 } from "lucide-react";
import API, { STOREFRONT_URL, assetUrl } from "../api/axios";
import { Badge, Button, Card, ConfirmDialog, EmptyState, Field, Input, LoadingState, Modal, PageHeader, Select, Textarea, Toggle } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { currency, parseLines, percentageOff, toLines } from "../utils/format";
import { getErrorMessage } from "../utils/errors";
import { isFiniteNumber, isWholeNumber, validateImageFiles, validateVideoFiles } from "../utils/validation";
import { downloadCsv } from "../utils/csv";
import { useObjectUrls } from "../hooks/useObjectUrl";
import { generateQrCodeSvg } from "../utils/qrcode";

const blank = {
  name: "", slug: "", sku: "", category: "", shortDescription: "", description: "", longDescription: "",
  price: "", mrp: "", stock: "0", lowStockThreshold: "5", unit: "Pack", weight: "",
  benefits: "", ingredients: "", suitableFor: "", howToUse: "", warnings: "", storageInstructions: "", legalDisclaimer: "",
  manufacturerName: "", marketerName: "", countryOfOrigin: "India", licenceType: "", licenceNumber: "", hsnCode: "", gstRate: "0",
  vegetarian: "", batchTrackingEnabled: false, expiryTrackingEnabled: false,
  seoTitle: "", seoDescription: "", isFeatured: false, isBestSeller: false, isActive: true, images: [],
  infographics: [], videos: [], clearInfographics: false, clearVideos: false,
  authenticityCode: "", verificationCount: 0,
};

const tabs = [
  ["basic", "Basics"], ["commercial", "Pricing & stock"], ["content", "Product information"], ["media", "Infographics & video"], ["compliance", "Compliance"], ["publishing", "SEO & visibility"], ["authenticity", "QR Authenticity"],
];

const mapProduct = (product) => ({
  ...blank,
  ...product,
  category: product.category?._id || product.category || "",
  price: String(product.price ?? ""), mrp: String(product.mrp ?? ""), stock: String(product.stock ?? 0), lowStockThreshold: String(product.lowStockThreshold ?? 5), gstRate: String(product.gstRate ?? 0),
  benefits: toLines(product.benefits), ingredients: toLines(product.ingredients), suitableFor: toLines(product.suitableFor), warnings: toLines(product.warnings),
  vegetarian: product.vegetarian === true ? "true" : product.vegetarian === false ? "false" : "",
  images: [], infographics: [], videos: [], clearInfographics: false, clearVideos: false,
  authenticityCode: product.authenticityCode || "",
  verificationCount: product.verificationCount || 0,
});

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [form, setForm] = useState(blank);
  const [existingImages, setExistingImages] = useState([]);
  const [existingInfographics, setExistingInfographics] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [productRes, categoryRes] = await Promise.all([
        API.get("/products/admin/all?limit=all&sort=newest"),
        API.get("/categories/admin/all"),
      ]);
      setProducts(productRes.data.data || []);
      setCategories(categoryRes.data.data || []);
    } catch (error) { toast.error(getErrorMessage(error, "Products could not be loaded.")); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => {
      const stockStatus = Number(product.stock || 0) <= 0 ? "OUT" : Number(product.stock || 0) <= Number(product.lowStockThreshold ?? 5) ? "LOW" : "IN";
      return (!categoryFilter || String(product.category?._id || product.category) === categoryFilter)
        && (statusFilter === "ALL" || statusFilter === "ACTIVE" && product.isActive !== false || statusFilter === "INACTIVE" && product.isActive === false || statusFilter === stockStatus)
        && (!keyword || [product.name, product.sku, product.slug, product.authenticityCode, product.category?.name].some((value) => String(value || "").toLowerCase().includes(keyword)));
    });
  }, [products, search, categoryFilter, statusFilter]);

  const openCreate = () => { setEditingId(""); setForm(blank); setExistingImages([]); setExistingInfographics([]); setExistingVideos([]); setActiveTab("basic"); setEditorOpen(true); };
  const openEdit = (product) => { setEditingId(product._id); setForm(mapProduct(product)); setExistingImages(product.images || []); setExistingInfographics(product.infographics || []); setExistingVideos(product.videos || []); setActiveTab("basic"); setEditorOpen(true); };

  const validate = () => {
    const price = Number(form.price);
    const mrp = Number(form.mrp);
    const stock = Number(form.stock);
    const lowStockThreshold = Number(form.lowStockThreshold);
    const gstRate = Number(form.gstRate);
    if (!form.name.trim() || !form.category || !form.description.trim()) return "Name, category and full description are required.";
    if (!isFiniteNumber(form.price) || price <= 0) return "Selling price must be greater than zero.";
    if (!isFiniteNumber(form.mrp) || mrp <= 0 || mrp < price) return "MRP must be greater than zero and equal to or above the selling price.";
    if (!isWholeNumber(stock) || stock < 0) return "Stock must be a non-negative whole number.";
    if (!isWholeNumber(lowStockThreshold) || lowStockThreshold < 0) return "Low-stock threshold must be a non-negative whole number.";
    if (!isFiniteNumber(form.gstRate) || gstRate < 0 || gstRate > 100) return "GST rate must be between 0 and 100.";
    if (!editingId && !form.images.length) return "Upload at least one product image.";
    const imageError = validateImageFiles(form.images);
    if (imageError) return imageError;
    const infographicError = validateImageFiles(form.infographics, { maxFiles: 8 });
    if (infographicError) return infographicError;
    const videoError = validateVideoFiles(form.videos);
    if (videoError) return videoError;
    if (form.shortDescription.length > 500) return "Short description must be 500 characters or fewer.";
    if (form.seoTitle.length > 70) return "SEO title must be 70 characters or fewer.";
    if (form.seoDescription.length > 180) return "SEO description must be 180 characters or fewer.";
    return "";
  };

  const submit = async () => {
    const errorMessage = validate();
    if (errorMessage) { toast.error(errorMessage); return; }
    try {
      setSaving(true);
      const fd = new FormData();
      const arrayFields = new Set(["benefits", "ingredients", "suitableFor", "warnings"]);
      const boolFields = new Set(["isFeatured", "isBestSeller", "isActive", "batchTrackingEnabled", "expiryTrackingEnabled", "clearInfographics", "clearVideos"]);
      Object.entries(form).forEach(([key, value]) => {
        if (["images", "infographics", "videos"].includes(key)) return;
        if (arrayFields.has(key)) fd.append(key, JSON.stringify(parseLines(value)));
        else if (boolFields.has(key)) fd.append(key, String(Boolean(value)));
        else fd.append(key, value ?? "");
      });
      form.images.forEach((file) => fd.append("images", file));
      form.infographics.forEach((file) => fd.append("infographics", file));
      form.videos.forEach((file) => fd.append("videos", file));
      const { data } = editingId ? await API.put(`/products/${editingId}`, fd) : await API.post("/products", fd);
      setProducts((current) => editingId ? current.map((product) => product._id === editingId ? data.data : product) : [data.data, ...current]);
      toast.success(data.message || "Product saved.");
      setEditorOpen(false);
    } catch (error) { toast.error(getErrorMessage(error, "Product could not be saved.")); }
    finally { setSaving(false); }
  };

  const archive = async () => {
    if (!archiveTarget) return;
    try { setSaving(true); const { data } = await API.delete(`/products/${archiveTarget._id}`); setProducts((current) => current.map((product) => product._id === archiveTarget._id ? { ...product, isActive: false } : product)); toast.success(data.message || "Product archived."); setArchiveTarget(null); }
    catch (error) { toast.error(getErrorMessage(error, "Product could not be archived.")); }
    finally { setSaving(false); }
  };

  const filePreviews = useObjectUrls(form.images);
  const infographicPreviews = useObjectUrls(form.infographics);
  const videoPreviews = useObjectUrls(form.videos);

  return <div className="space-y-6">
    <PageHeader eyebrow="Catalogue management" title="Products" description="Manage product data, prices, stock, compliance and QR authenticity verification codes." actions={<><Button variant="secondary" onClick={() => downloadCsv("legend-products.csv", visible, [{ label: "Name", value: "name" }, { label: "SKU", value: "sku" }, { label: "Auth Code", value: "authenticityCode" }, { label: "Category", value: (item) => item.category?.name || "" }, { label: "Price", value: "price" }, { label: "MRP", value: "mrp" }, { label: "Stock", value: "stock" }, { label: "Low stock threshold", value: "lowStockThreshold" }, { label: "GST rate", value: "gstRate" }, { label: "HSN", value: "hsnCode" }, { label: "Active", value: (item) => item.isActive !== false ? "Yes" : "No" }])} disabled={!visible.length}><Download size={17} /> Export</Button><Button variant="secondary" onClick={load}><RefreshCw size={17} /> Refresh</Button><Button onClick={openCreate}><Plus size={17} /> Add product</Button></>} />
    <Card className="overflow-hidden">
      <div className="grid gap-3 border-b border-stone-200 p-4 lg:grid-cols-[1fr_220px_190px]"><div className="relative"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" /><Input className="pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, SKU, auth code, slug or category" /></div><Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="">All categories</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</Select><Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="LOW">Low stock</option><option value="OUT">Out of stock</option><option value="IN">Healthy stock</option></Select></div>
      {loading ? <LoadingState label="Loading catalogue…" /> : visible.length ? <div className="table-wrap"><table className="data-table min-w-[1180px]"><thead><tr><th>Product</th><th>Commercial</th><th>Stock</th><th>QR Authenticity</th><th>Storefront</th><th className="text-right">Actions</th></tr></thead><tbody>{visible.map((product) => { const discount = percentageOff(product.mrp, product.price); const low = Number(product.stock || 0) <= Number(product.lowStockThreshold ?? 5); return <tr key={product._id}><td><div className="flex items-center gap-3"><div className="h-14 w-14 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">{product.images?.[0] ? <img src={assetUrl(product.images[0])} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-stone-400"><ImagePlus size={20} /></div>}</div><div className="min-w-0"><p className="max-w-xs truncate font-bold text-stone-950">{product.name}</p><p className="mt-0.5 text-xs text-stone-500">{product.sku || "No SKU"} · {product.category?.name || "Uncategorised"}</p><p className="mt-0.5 max-w-xs truncate text-xs text-stone-400">/{product.slug}</p></div></div></td><td><p className="font-bold text-stone-950">{currency(product.price)}</p><p className="text-xs text-stone-500"><span className="line-through">{currency(product.mrp)}</span>{discount > 0 && ` · ${discount}% off`}</p><p className="mt-1 text-xs text-stone-500">GST {Number(product.gstRate || 0)}% · HSN {product.hsnCode || "—"}</p></td><td><Badge tone={Number(product.stock) <= 0 ? "danger" : low ? "warning" : "success"}>{Number(product.stock) <= 0 ? "Out of stock" : `${product.stock} available`}</Badge><p className="mt-2 text-xs text-stone-500">Alert at {product.lowStockThreshold ?? 5}</p></td><td><div className="space-y-1 text-xs text-stone-700 font-mono"><p className="font-bold text-stone-950">{product.authenticityCode || "Auto-generated"}</p><p className="text-emerald-700 font-semibold">{product.verificationCount || 0} scans verified</p></div></td><td><div className="flex flex-wrap gap-1.5">{product.isActive !== false ? <Badge tone="success">Active</Badge> : <Badge>Hidden</Badge>}{product.isFeatured && <Badge tone="info"><Star size={11} /> Featured</Badge>}{product.isBestSeller && <Badge tone="warning">Best seller</Badge>}</div></td><td className="text-right"><div className="inline-flex gap-1.5"><a className="btn btn-secondary btn-sm" title="View Storefront" href={`${STOREFRONT_URL}/products/${product.slug}`} target="_blank" rel="noreferrer"><Eye size={15} /></a><a className="btn btn-secondary btn-sm" title="Verify QR Page" href={`${STOREFRONT_URL}/verify/${product.authenticityCode || product._id}`} target="_blank" rel="noreferrer"><QrCode size={15} /></a><Button size="sm" variant="secondary" onClick={() => openEdit(product)}><Pencil size={15} /> Edit</Button>{product.isActive !== false && <Button size="sm" variant="danger" onClick={() => setArchiveTarget(product)}><Archive size={15} /></Button>}</div></td></tr>; })}</tbody></table></div> : <EmptyState title="No products match" description="Change your filters or add a new product." action={<Button onClick={openCreate}><Plus size={17} /> Add product</Button>} />}
    </Card>

    <Modal open={editorOpen} onClose={() => setEditorOpen(false)} title={editingId ? "Edit product" : "Add product"} description="Fields marked with * are required. New gallery, infographic or video files replace only their corresponding current set." size="xl" footer={<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="secondary" onClick={() => setEditorOpen(false)}>Cancel</Button><Button onClick={submit} disabled={saving}>{saving ? "Saving product…" : editingId ? "Update product" : "Create product"}</Button></div>}>
      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-stone-200 pb-3">{tabs.map(([value, label]) => <button key={value} type="button" onClick={() => setActiveTab(value)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold ${activeTab === value ? "bg-[#FF5500] text-white" : "text-stone-600 hover:bg-stone-100"}`}>{label}</button>)}</div>
      {activeTab === "basic" && <div className="grid gap-5 md:grid-cols-2"><Field label="Product name" required><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></Field><Field label="Category" required><Select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}><option value="">Select category</option>{categories.filter((category) => category.isActive !== false || category._id === form.category).map((category) => <option key={category._id} value={category._id}>{category.name}{category.isActive === false ? " (inactive)" : ""}</option>)}</Select></Field><Field label="Slug" hint="Leave blank on new products to generate it from the name."><Input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} /></Field><Field label="SKU"><Input value={form.sku} onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value.toUpperCase() }))} /></Field><Field label="Short description" className="md:col-span-2"><Textarea rows="3" value={form.shortDescription} onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))} maxLength="500" /></Field><Field label="Full description" required className="md:col-span-2"><Textarea rows="6" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></Field><Field label="Additional long description" className="md:col-span-2"><Textarea rows="5" value={form.longDescription} onChange={(event) => setForm((current) => ({ ...current, longDescription: event.target.value }))} /></Field><Field label="Product images" className="md:col-span-2" hint={editingId ? "Select new files only when you want to replace all current images. Maximum 6." : "Upload clear front, back and information images. Maximum 6."}><Input type="file" accept="image/*" multiple onChange={(event) => setForm((current) => ({ ...current, images: Array.from(event.target.files || []).slice(0, 6) }))} /></Field>{(existingImages.length > 0 || filePreviews.length > 0) && <div className="md:col-span-2"><p className="field-label">Image preview</p><div className="flex flex-wrap gap-3">{(filePreviews.length ? filePreviews : existingImages.map(assetUrl)).map((url) => <img key={url} src={url} alt="Product preview" className="h-24 w-24 rounded-xl border border-stone-200 object-cover" />)}</div></div>}</div>}
      {activeTab === "commercial" && <div className="grid gap-5 md:grid-cols-2"><Field label="Selling price" required><Input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} /></Field><Field label="MRP" required><Input type="number" min="0" step="0.01" value={form.mrp} onChange={(event) => setForm((current) => ({ ...current, mrp: event.target.value }))} /></Field><Field label="Available stock"><Input type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} /></Field><Field label="Low-stock threshold"><Input type="number" min="0" step="1" value={form.lowStockThreshold} onChange={(event) => setForm((current) => ({ ...current, lowStockThreshold: event.target.value }))} /></Field><Field label="Pack/unit"><Input value={form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))} placeholder="Bottle, box, pack" /></Field><Field label="Net quantity / weight"><Input value={form.weight} onChange={(event) => setForm((current) => ({ ...current, weight: event.target.value }))} placeholder="60 Capsules, 200 ml" /></Field><Field label="GST rate"><Input type="number" min="0" max="100" step="0.01" value={form.gstRate} onChange={(event) => setForm((current) => ({ ...current, gstRate: event.target.value }))} /></Field><Field label="HSN code"><Input value={form.hsnCode} onChange={(event) => setForm((current) => ({ ...current, hsnCode: event.target.value }))} /></Field><Toggle checked={form.batchTrackingEnabled} onChange={(value) => setForm((current) => ({ ...current, batchTrackingEnabled: value }))} label="Batch tracking required" description="The current backend stores the flag but not batch-wise stock records." /><Toggle checked={form.expiryTrackingEnabled} onChange={(value) => setForm((current) => ({ ...current, expiryTrackingEnabled: value }))} label="Expiry tracking required" description="Use this flag for products that must later receive batch/expiry records." /></div>}
      {activeTab === "content" && <div className="grid gap-5 md:grid-cols-2"><Field label="Benefits" hint="One point per line."><Textarea rows="8" value={form.benefits} onChange={(event) => setForm((current) => ({ ...current, benefits: event.target.value }))} /></Field><Field label="Ingredients" hint="One ingredient per line."><Textarea rows="8" value={form.ingredients} onChange={(event) => setForm((current) => ({ ...current, ingredients: event.target.value }))} /></Field><Field label="Suitable for" hint="One audience or use case per line."><Textarea rows="6" value={form.suitableFor} onChange={(event) => setForm((current) => ({ ...current, suitableFor: event.target.value }))} /></Field><Field label="Warnings" hint="Use packaging-approved wording only."><Textarea rows="6" value={form.warnings} onChange={(event) => setForm((current) => ({ ...current, warnings: event.target.value }))} /></Field><Field label="How to use" className="md:col-span-2"><Textarea rows="4" value={form.howToUse} onChange={(event) => setForm((current) => ({ ...current, howToUse: event.target.value }))} /></Field><Field label="Storage instructions"><Textarea rows="4" value={form.storageInstructions} onChange={(event) => setForm((current) => ({ ...current, storageInstructions: event.target.value }))} /></Field><Field label="Legal disclaimer"><Textarea rows="4" value={form.legalDisclaimer} onChange={(event) => setForm((current) => ({ ...current, legalDisclaimer: event.target.value }))} /></Field></div>}
      {activeTab === "media" && (
        <div className="space-y-7">
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div><div className="flex items-center gap-2"><ImagePlus size={19} className="text-brand-700" /><h3 className="font-bold text-stone-950">Description infographics</h3></div><p className="mt-2 text-sm leading-6 text-stone-600">Upload up to 8 JPG, PNG or WEBP graphics. They appear after the written product description in the selected order.</p></div>
              {existingInfographics.length > 0 && <Button type="button" size="sm" variant="danger" onClick={() => { setExistingInfographics([]); setForm((current) => ({ ...current, infographics: [], clearInfographics: true })); }}><Trash2 size={15} /> Remove existing</Button>}
            </div>
            <Field label="Infographic files" className="mt-4" hint={editingId ? "New files replace the current infographic set. Maximum 8." : "Maximum 8 images."}><Input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setForm((current) => ({ ...current, infographics: Array.from(event.target.files || []).slice(0, 8), clearInfographics: false }))} /></Field>
            {(existingInfographics.length > 0 || infographicPreviews.length > 0) && <div className="mt-4"><p className="field-label">Infographic preview</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{(infographicPreviews.length ? infographicPreviews : existingInfographics.map((item) => assetUrl(item.url || item))).map((url, index) => <div key={`${url}-${index}`} className="overflow-hidden rounded-xl border border-stone-200 bg-white"><img src={url} alt={`Infographic preview ${index + 1}`} className="aspect-[4/5] h-full w-full object-contain" /></div>)}</div></div>}
            {form.clearInfographics && !form.infographics.length && <p className="mt-3 text-sm font-semibold text-red-700">All current infographics will be removed when you save.</p>}
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div><div className="flex items-center gap-2"><Film size={19} className="text-brand-700" /><h3 className="font-bold text-stone-950">Product videos</h3></div><p className="mt-2 text-sm leading-6 text-stone-600">Upload up to 2 MP4, WEBM or MOV videos. Videos use native controls and appear beneath the infographics.</p></div>
              {existingVideos.length > 0 && <Button type="button" size="sm" variant="danger" onClick={() => { setExistingVideos([]); setForm((current) => ({ ...current, videos: [], clearVideos: true })); }}><Trash2 size={15} /> Remove existing</Button>}
            </div>
            <Field label="Video files" className="mt-4" hint={editingId ? "New files replace the current video set. Maximum 2; 10 MB each by default." : "Maximum 2 videos; 10 MB each by default."}><Input type="file" accept="video/mp4,video/webm,video/quicktime" multiple onChange={(event) => setForm((current) => ({ ...current, videos: Array.from(event.target.files || []).slice(0, 2), clearVideos: false }))} /></Field>
            {(existingVideos.length > 0 || videoPreviews.length > 0) && <div className="mt-4"><p className="field-label">Video preview</p><div className="grid gap-3 sm:grid-cols-2">{(videoPreviews.length ? videoPreviews : existingVideos.map((item) => assetUrl(item.url || item))).map((url, index) => <video key={`${url}-${index}`} src={url} controls preload="metadata" className="aspect-video w-full rounded-xl border border-stone-200 bg-black object-contain" />)}</div></div>}
            {form.clearVideos && !form.videos.length && <p className="mt-3 text-sm font-semibold text-red-700">All current videos will be removed when you save.</p>}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Use packaging-approved claims only. Do not add before/after graphics, guaranteed outcomes or medical claims that are not supported by the product licence and final label.</div>
        </div>
      )}
      {activeTab === "compliance" && <div className="grid gap-5 md:grid-cols-2"><Field label="Manufacturer name"><Input value={form.manufacturerName} onChange={(event) => setForm((current) => ({ ...current, manufacturerName: event.target.value }))} /></Field><Field label="Marketer name"><Input value={form.marketerName} onChange={(event) => setForm((current) => ({ ...current, marketerName: event.target.value }))} /></Field><Field label="Country of origin"><Input value={form.countryOfOrigin} onChange={(event) => setForm((current) => ({ ...current, countryOfOrigin: event.target.value }))} /></Field><Field label="Dietary mark"><Select value={form.vegetarian} onChange={(event) => setForm((current) => ({ ...current, vegetarian: event.target.value }))}><option value="">Not specified</option><option value="true">Vegetarian</option><option value="false">Non-vegetarian</option></Select></Field><Field label="Licence type"><Input value={form.licenceType} onChange={(event) => setForm((current) => ({ ...current, licenceType: event.target.value }))} placeholder="AYUSH, FSSAI or applicable type" /></Field><Field label="Licence number"><Input value={form.licenceNumber} onChange={(event) => setForm((current) => ({ ...current, licenceNumber: event.target.value }))} /></Field><div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Verify composition, dosage, MRP, licence details, suitability and warnings against the final approved packaging before publishing.</div></div>}
      {activeTab === "publishing" && <div className="grid gap-5 md:grid-cols-2"><Field label="SEO title" hint={`${form.seoTitle.length}/70 characters`}><Input maxLength="70" value={form.seoTitle} onChange={(event) => setForm((current) => ({ ...current, seoTitle: event.target.value }))} /></Field><Field label="SEO description" hint={`${form.seoDescription.length}/180 characters`}><Textarea rows="4" maxLength="180" value={form.seoDescription} onChange={(event) => setForm((current) => ({ ...current, seoDescription: event.target.value }))} /></Field><Toggle checked={form.isActive} onChange={(value) => setForm((current) => ({ ...current, isActive: value }))} label="Visible on storefront" description="Inactive products remain in admin but cannot be purchased." /><Toggle checked={form.isFeatured} onChange={(value) => setForm((current) => ({ ...current, isFeatured: value }))} label="Featured product" description="Allows homepage and featured catalogue placement." /><Toggle checked={form.isBestSeller} onChange={(value) => setForm((current) => ({ ...current, isBestSeller: value }))} label="Best seller" description="Use only when supported by actual sales or merchandising decisions." /></div>}
      {activeTab === "authenticity" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#FF5500]/30 bg-stone-900 p-6 text-white shadow-xl">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-emerald-950 border border-emerald-700/60 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-400">
                  <ShieldCheck size={14} /> Security Protocol
                </div>
                <h3 className="text-xl font-black uppercase text-white">Product Authenticity & QR Code</h3>
                <p className="text-xs text-stone-300 max-w-md leading-5">
                  This QR code is uniquely tied to <strong className="text-white">{form.name || "this product"}</strong>. Print this QR code on packaging or tubs so customers can scan it directly with their smartphones to confirm 100% genuine product authenticity.
                </p>
                <div className="pt-2 text-xs font-mono text-stone-300">
                  <p><strong>Auth Code:</strong> <span className="text-[#FFB800]">{form.authenticityCode || "Auto-generated on save"}</span></p>
                  <p><strong>Total Scans:</strong> <span className="text-emerald-400">{form.verificationCount || 0} scans verified</span></p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl bg-white p-4 text-stone-950 shadow-md shrink-0">
                {form.authenticityCode ? (
                  <div dangerouslySetInnerHTML={{ __html: generateQrCodeSvg(`${STOREFRONT_URL}/verify/${form.authenticityCode}`, { size: 160 }) }} />
                ) : (
                  <div className="grid h-40 w-40 place-items-center bg-stone-100 text-stone-400 text-xs font-bold text-center p-2">
                    QR Code will generate after saving
                  </div>
                )}
                <p className="mt-2 text-[10px] font-bold text-stone-500 uppercase tracking-wider">Scan to Verify</p>
              </div>
            </div>

            {form.authenticityCode && (
              <div className="mt-6 flex flex-wrap gap-3 border-t border-stone-800 pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const svgStr = generateQrCodeSvg(`${STOREFRONT_URL}/verify/${form.authenticityCode}`, { size: 600 });
                    const blob = new Blob([svgStr], { type: "image/svg+xml" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${form.slug || "product"}-authenticity-qr.svg`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success("QR Code SVG downloaded!");
                  }}
                >
                  <Download size={15} /> Download SVG for Printing
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(`${STOREFRONT_URL}/verify/${form.authenticityCode}`);
                    toast.success("Verification URL copied to clipboard!");
                  }}
                >
                  <Copy size={15} /> Copy Verification Link
                </Button>

                <a
                  href={`${STOREFRONT_URL}/verify/${form.authenticityCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm inline-flex items-center gap-1.5"
                >
                  <ExternalLink size={15} /> Test Client Scan Page
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
    <ConfirmDialog open={Boolean(archiveTarget)} onClose={() => setArchiveTarget(null)} onConfirm={archive} loading={saving} dangerous title="Archive product" confirmLabel="Archive product" description={`Archive ${archiveTarget?.name}? It will be hidden from the storefront, but existing order records remain intact.`} />
  </div>;
}
