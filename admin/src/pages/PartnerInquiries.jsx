import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import API from "../api/axios";
import { Badge, Button, Card, EmptyState, LoadingState, PageHeader, Pagination } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/errors";
import { dateTime } from "../utils/format";

const tones = { NEW: "warning", READ: "info", RESOLVED: "success" };
export default function PartnerInquiries() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const toast = useToast();
  const load = useCallback(async () => {
    try { setLoading(true); const query = new URLSearchParams({ page: String(page), limit: "20" }); if (status) query.set("status", status); const { data } = await API.get(`/partners/admin?${query}`); setItems(data.data || []); setPages(data.pagination?.pages || 1); }
    catch (error) { toast.error(getErrorMessage(error, "Dealer inquiries could not be loaded.")); }
    finally { setLoading(false); }
  }, [page, status, toast]);
  useEffect(() => { load(); }, [load]);
  const updateStatus = async (id, nextStatus) => {
    try { setSavingId(id); const { data } = await API.patch(`/partners/admin/${id}/status`, { status: nextStatus }); setItems((current) => current.map((item) => item._id === id ? data.data : item)); toast.success("Inquiry updated."); }
    catch (error) { toast.error(getErrorMessage(error, "Could not update inquiry.")); }
    finally { setSavingId(""); }
  };
  return <div className="space-y-6">
    <PageHeader eyebrow="Wholesale and distribution" title="Dealer inquiries" description="Submissions from the Become a Dealer form." actions={<Button variant="secondary" onClick={load}><RefreshCw size={17} /> Refresh</Button>} />
    <div className="flex gap-2 overflow-x-auto">{[["", "All"], ["NEW", "New"], ["READ", "Read"], ["RESOLVED", "Resolved"]].map(([value, label]) => <button key={label} type="button" onClick={() => { setStatus(value); setPage(1); }} className={`rounded-xl px-4 py-2 text-sm font-bold ${status === value ? "bg-brand-800 text-white" : "border border-stone-200 bg-white text-stone-600"}`}>{label}</button>)}</div>
    <Card className="overflow-hidden">{loading ? <LoadingState label="Loading dealer inquiries…" /> : items.length ? <div className="divide-y divide-stone-100">{items.map((item) => <article key={item._id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]"><div><div className="flex flex-wrap items-center gap-2"><Badge tone={tones[item.status]}>{item.status}</Badge><span className="text-xs text-stone-500">{dateTime(item.createdAt)}</span></div><h2 className="mt-3 text-lg font-bold text-stone-950">{item.firstName} {item.lastName}</h2><div className="mt-2 grid gap-1 text-sm text-stone-700 sm:grid-cols-2"><p><strong>Email:</strong> <a className="text-brand-800 hover:underline" href={`mailto:${item.email}`}>{item.email}</a></p><p><strong>Phone:</strong> <a className="text-brand-800 hover:underline" href={`tel:${item.contactNumber}`}>{item.contactNumber}</a></p><p><strong>GST:</strong> {item.gstNumber || "—"}</p><p><strong>Category:</strong> {item.category}</p><p><strong>State:</strong> {item.state}</p><p><strong>Monthly sales:</strong> {item.expectedMonthlySales}</p><p className="sm:col-span-2"><strong>Address:</strong> {item.address}</p><p className="sm:col-span-2"><strong>Current business:</strong> {item.currentBusiness}</p>{item.message && <p className="whitespace-pre-wrap sm:col-span-2"><strong>Message:</strong> {item.message}</p>}</div></div><div className="flex items-start gap-2 lg:flex-col lg:items-stretch">{item.status === "NEW" && <Button size="sm" variant="secondary" disabled={savingId === item._id} onClick={() => updateStatus(item._id, "READ")}>Mark read</Button>}{item.status !== "RESOLVED" && <Button size="sm" disabled={savingId === item._id} onClick={() => updateStatus(item._id, "RESOLVED")}>Resolve</Button>}</div></article>)}</div> : <EmptyState title="No dealer inquiries" description="New dealer submissions will appear here." />}<Pagination page={page} pages={pages} onChange={setPage} /></Card>
  </div>;
}
