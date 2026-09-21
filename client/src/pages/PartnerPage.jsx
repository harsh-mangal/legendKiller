import { useState } from "react";
import RouteMeta from "../components/layout/RouteMeta";
import { partnerApi, getErrorMessage } from "../services/api";

const states = "Andhra Pradesh|Arunachal Pradesh|Assam|Bihar|Chhattisgarh|Goa|Gujarat|Haryana|Himachal Pradesh|Jharkhand|Karnataka|Kerala|Madhya Pradesh|Maharashtra|Manipur|Meghalaya|Mizoram|Nagaland|Odisha|Punjab|Rajasthan|Sikkim|Tamil Nadu|Telangana|Tripura|Uttar Pradesh|Uttarakhand|West Bengal|Andaman and Nicobar Islands|Chandigarh|Dadra and Nagar Haveli and Daman and Diu|Delhi|Jammu and Kashmir|Ladakh|Lakshadweep|Puducherry".split("|");
const categories = ["Distributor", "Wholesaler", "Retailer", "Gym or fitness studio", "Other"];
const salesRanges = ["Under ₹1 lakh", "₹1–5 lakh", "₹5–10 lakh", "₹10–25 lakh", "Above ₹25 lakh"];
const initial = { firstName: "", lastName: "", gstNumber: "", email: "", contactNumber: "", address: "", state: "", category: "", expectedMonthlySales: "", message: "", currentBusiness: "" };

export default function PartnerPage() {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const update = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true); setError(""); setSuccess(false);
    try { await partnerApi.submit(form); setForm(initial); setSuccess(true); }
    catch (cause) { setError(getErrorMessage(cause, "Could not submit your inquiry. Please try again.")); }
    finally { setSaving(false); }
  };
  const field = (name, label, required = false, type = "text") => <label className="block text-sm font-bold text-slate-200">{label}{required ? " *" : ""}<input type={type} required={required} maxLength={name === "gstNumber" ? 15 : undefined} value={form[name]} onChange={(event) => update(name, event.target.value)} className="mt-2 w-full" autoComplete={name === "email" ? "email" : name === "firstName" ? "given-name" : name === "lastName" ? "family-name" : name === "contactNumber" ? "tel" : undefined} /></label>;
  const choice = (name, label, options) => <label className="block text-sm font-bold text-slate-200">{label} *<select required value={form[name]} onChange={(event) => update(name, event.target.value)} className="mt-2 w-full"><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
  return <div className="container-page py-12 sm:py-20">
    <RouteMeta title="Become a Partner | Legend Born Nutrition" description="Send a wholesale or distribution inquiry to Legend Born Nutrition." />
    <div className="mx-auto max-w-3xl border border-slate-700 bg-[#121216] p-5 sm:p-10">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FFB800]">Become a Partner</p>
      <h1 className="mt-3 text-3xl font-black uppercase text-white sm:text-4xl">Wholesale/Distribution Inquiry</h1>
      <p className="mt-5 border-l-2 border-[#FF5500] pl-4 text-sm leading-6 text-slate-300">By submitting your contact information, you consent to be contacted by telephone or email about purchasing a product, obtaining a dealership, or related products and services.</p>
      {success && <div role="status" className="mt-6 border border-emerald-500 bg-emerald-500/10 p-4 text-emerald-300">Thank you. Your partnership inquiry has been received.</div>}
      {error && <div role="alert" className="mt-6 border border-red-500 bg-red-500/10 p-4 text-red-300">{error}</div>}
      <form onSubmit={submit} className="mt-8 grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">{field("firstName", "First Name", true)}{field("lastName", "Last Name")}</div>
        {field("gstNumber", "GST No.")}
        {field("email", "Email", true, "email")}
        {field("contactNumber", "Contact Number", true, "tel")}
        {field("address", "Address/Location", true)}
        {choice("state", "State", states)}
        {choice("category", "Category", categories)}
        {choice("expectedMonthlySales", "Expected Monthly Sales", salesRanges)}
        <label className="block text-sm font-bold text-slate-200">Message<textarea value={form.message} onChange={(event) => update("message", event.target.value)} rows={4} maxLength={3000} className="mt-2 w-full" /></label>
        {field("currentBusiness", "Current Business", true)}
        <button type="submit" disabled={saving} className="btn-primary mt-3 w-full">{saving ? "Submitting…" : "Submit Inquiry"}</button>
      </form>
    </div>
  </div>;
}
