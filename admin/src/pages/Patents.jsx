import { useCallback, useEffect, useState } from "react";
import { ExternalLink, FileUp, RefreshCw, Trash2 } from "lucide-react";
import API, { assetUrl } from "../api/axios";
import { Button, Card, EmptyState, LoadingState, PageHeader } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/errors";

export default function Patents() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [published, setPublished] = useState(true);
  const toast = useToast();
  const load = useCallback(async () => {
    try { setLoading(true); const { data } = await API.get("/patents/admin"); setItems(data.data || []); }
    catch (error) { toast.error(getErrorMessage(error, "Patents could not be loaded.")); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);
  const submit = async (event) => {
    event.preventDefault();
    if (!file || file.type !== "application/pdf") { toast.error("Select a PDF file."); return; }
    try { setSaving(true); const body = new FormData(); body.append("title", title); body.append("description", description); body.append("isPublished", String(published)); body.append("file", file); await API.post("/patents", body); setTitle(""); setDescription(""); setFile(null); event.target.reset(); toast.success("Patent uploaded."); load(); }
    catch (error) { toast.error(getErrorMessage(error, "Patent upload failed.")); }
    finally { setSaving(false); }
  };
  const toggle = async (item) => { try { await API.patch(`/patents/${item._id}`, { isPublished: !item.isPublished }); load(); } catch (error) { toast.error(getErrorMessage(error, "Could not update patent.")); } };
  const remove = async (item) => { if (!window.confirm(`Delete “${item.title}”?`)) return; try { await API.delete(`/patents/${item._id}`); toast.success("Patent deleted."); load(); } catch (error) { toast.error(getErrorMessage(error, "Could not delete patent.")); } };
  return <div className="space-y-6"><PageHeader eyebrow="Research documents" title="Patents" description="Upload PDF documents and control which patents appear on the storefront." actions={<Button variant="secondary" onClick={load}><RefreshCw size={17} /> Refresh</Button>} />
    <Card className="p-5"><form onSubmit={submit} className="grid gap-4"><h2 className="text-lg font-bold text-stone-950">Upload patent</h2><label className="grid gap-1 text-sm font-semibold text-stone-700">Title *<input required value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg border border-stone-300 px-3 py-2" /></label><label className="grid gap-1 text-sm font-semibold text-stone-700">Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-lg border border-stone-300 px-3 py-2" /></label><label className="grid gap-1 text-sm font-semibold text-stone-700">PDF *<input type="file" accept="application/pdf,.pdf" required onChange={(e) => setFile(e.target.files?.[0] || null)} /></label><label className="flex items-center gap-2 text-sm font-semibold text-stone-700"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Publish on storefront</label><div><Button type="submit" disabled={saving}><FileUp size={17} /> {saving ? "Uploading…" : "Upload PDF"}</Button></div></form></Card>
    <Card className="overflow-hidden">{loading ? <LoadingState label="Loading patents…" /> : items.length ? <div className="divide-y divide-stone-100">{items.map((item) => <article key={item._id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><h2 className="font-bold text-stone-950">{item.title}</h2>{item.description && <p className="mt-1 text-sm text-stone-600">{item.description}</p>}<p className="mt-1 text-xs font-bold uppercase text-stone-500">{item.isPublished ? "Published" : "Draft"}</p></div><div className="flex flex-wrap gap-2"><a href={assetUrl(item.fileUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-2 text-sm font-bold text-stone-800"><ExternalLink size={15} /> View</a><Button size="sm" variant="secondary" onClick={() => toggle(item)}>{item.isPublished ? "Unpublish" : "Publish"}</Button><Button size="sm" variant="secondary" onClick={() => remove(item)}><Trash2 size={15} /> Delete</Button></div></article>)}</div> : <EmptyState title="No patents uploaded" description="Upload a PDF above to add the first patent." />}</Card>
  </div>;
}
