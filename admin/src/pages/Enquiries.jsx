import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Download, Mail, MessageSquareText, Phone, RefreshCw } from "lucide-react";
import API from "../api/axios";
import { Badge, Button, Card, EmptyState, LoadingState, PageHeader, Pagination } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { dateTime } from "../utils/format";
import { getErrorMessage } from "../utils/errors";
import { downloadCsv } from "../utils/csv";

const tones = { NEW: "warning", READ: "info", RESOLVED: "success" };

export default function Enquiries() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const toast = useToast();

  const load = useCallback(async () => {
    try { setLoading(true); const query = new URLSearchParams({ page: String(page), limit: "20" }); if (status) query.set("status", status); const { data } = await API.get(`/contact/admin?${query}`); setItems(data.data || []); setPages(data.pagination?.pages || 1); }
    catch (error) { toast.error(getErrorMessage(error, "Enquiries could not be loaded.")); }
    finally { setLoading(false); }
  }, [page, status, toast]);
  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, nextStatus) => {
    try { setSavingId(id); const { data } = await API.patch(`/contact/admin/${id}/status`, { status: nextStatus }); setItems((current) => current.map((item) => item._id === id ? data.data : item)); toast.success(data.message || "Enquiry updated."); }
    catch (error) { toast.error(getErrorMessage(error, "Enquiry status could not be updated.")); }
    finally { setSavingId(""); }
  };

  return <div className="space-y-6">
    <PageHeader eyebrow="Lead and support inbox" title="Customer enquiries" description="Contact requests submitted through the storefront. Mark each message as read and resolved after a genuine follow-up." actions={<><Button variant="secondary" onClick={() => downloadCsv(`ameyka-enquiries-page-${page}.csv`, items, [{ label: "Name", value: "name" }, { label: "Email", value: "email" }, { label: "Phone", value: "phone" }, { label: "Subject", value: "subject" }, { label: "Message", value: "message" }, { label: "Status", value: "status" }, { label: "Received", value: "createdAt" }])} disabled={!items.length}><Download size={17} /> Export page</Button><Button variant="secondary" onClick={load}><RefreshCw size={17} /> Refresh</Button></>} />
    <div className="flex gap-2 overflow-x-auto">{[["", "All"], ["NEW", "New"], ["READ", "Read"], ["RESOLVED", "Resolved"]].map(([value, label]) => <button key={label} type="button" onClick={() => { setStatus(value); setPage(1); }} className={`rounded-xl px-4 py-2 text-sm font-bold ${status === value ? "bg-brand-800 text-white" : "border border-stone-200 bg-white text-stone-600"}`}>{label}</button>)}</div>
    <Card className="overflow-hidden">{loading ? <LoadingState label="Loading customer messages…" /> : items.length ? <div className="divide-y divide-stone-100">{items.map((item) => <article key={item._id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]"><div><div className="flex flex-wrap items-center gap-2"><Badge tone={tones[item.status]}>{item.status}</Badge><span className="text-xs text-stone-500">{dateTime(item.createdAt)}</span></div><h2 className="mt-3 text-base font-bold text-stone-950">{item.subject || "Product or order enquiry"}</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">{item.message}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-stone-600"><span className="inline-flex items-center gap-1.5"><MessageSquareText size={14} />{item.name}</span><a className="inline-flex items-center gap-1.5 text-brand-800 hover:underline" href={`mailto:${item.email}`}><Mail size={14} />{item.email}</a>{item.phone && <a className="inline-flex items-center gap-1.5 text-brand-800 hover:underline" href={`tel:${item.phone}`}><Phone size={14} />{item.phone}</a>}</div></div><div className="flex items-start gap-2 lg:flex-col lg:items-stretch">{item.status === "NEW" && <Button size="sm" variant="secondary" disabled={savingId === item._id} onClick={() => updateStatus(item._id, "READ")}>Mark read</Button>}{item.status !== "RESOLVED" && <Button size="sm" disabled={savingId === item._id} onClick={() => updateStatus(item._id, "RESOLVED")}><CheckCircle2 size={15} /> Resolve</Button>}</div></article>)}</div> : <EmptyState title="No enquiries in this view" description="New support or product-interest submissions will appear here." />}<Pagination page={page} pages={pages} onChange={setPage} /></Card>
  </div>;
}
