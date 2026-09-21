import { useEffect, useState } from "react";
import { ExternalLink, FileText } from "lucide-react";
import RouteMeta from "../components/layout/RouteMeta";
import { imageUrl, patentApi } from "../services/api";

export default function PatentsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { patentApi.list().then(setItems).catch(() => {}).finally(() => setLoading(false)); }, []);
  return <div className="container-page py-12 sm:py-20">
    <RouteMeta title="Patents | Legend Born Nutrition" description="Explore published patent documents from Legend Born Nutrition." />
    <p className="section-eyebrow">Our research</p><h1 className="section-title mt-4">Patents</h1>
    {loading ? <p className="mt-8 text-slate-400">Loading patents…</p> : items.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <article key={item._id} className="border border-slate-800 bg-[#121216] p-6"><FileText className="text-[#FFB800]" size={30} /><h2 className="mt-4 text-lg font-black uppercase text-white">{item.title}</h2>{item.description && <p className="mt-2 text-sm text-slate-300">{item.description}</p>}<a href={imageUrl(item.fileUrl)} target="_blank" rel="noreferrer" className="btn-outline mt-5"><ExternalLink size={16} /> View PDF</a></article>)}</div> : <p className="mt-8 border border-slate-800 bg-[#121216] p-6 text-slate-300">No patent documents are published yet.</p>}
  </div>;
}
