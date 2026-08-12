import { useCallback, useEffect, useState } from "react";
import { CreditCard, MapPin, RefreshCw, Save, Truck } from "lucide-react";
import API from "../api/axios";
import { Button, Card, Field, Input, LoadingState, PageHeader, Textarea, Toggle } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/errors";
import { parseLines, toLines } from "../utils/format";
import { intersect, isFiniteNumber, isWholeNumber, validateIndianPincodes } from "../utils/validation";

const blank = { serviceAllIndia: true, serviceablePincodes: "", excludedPincodes: "", codEnabled: true, onlinePaymentEnabled: true, shippingFee: "80", freeShippingThreshold: "999", estimatedDaysMin: "3", estimatedDaysMax: "7" };

export default function Delivery() {
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const load = useCallback(async () => {
    try { setLoading(true); const { data } = await API.get("/delivery/admin/settings"); const item = data.data || {}; setForm({ ...blank, ...item, serviceablePincodes: toLines(item.serviceablePincodes), excludedPincodes: toLines(item.excludedPincodes), shippingFee: String(item.shippingFee ?? 80), freeShippingThreshold: String(item.freeShippingThreshold ?? 999), estimatedDaysMin: String(item.estimatedDaysMin ?? 3), estimatedDaysMax: String(item.estimatedDaysMax ?? 7) }); }
    catch (error) { toast.error(getErrorMessage(error, "Delivery settings could not be loaded.")); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const min = Number(form.estimatedDaysMin);
    const max = Number(form.estimatedDaysMax);
    const shippingFee = Number(form.shippingFee || 0);
    const freeShippingThreshold = Number(form.freeShippingThreshold || 0);
    const serviceable = validateIndianPincodes(parseLines(form.serviceablePincodes));
    const excluded = validateIndianPincodes(parseLines(form.excludedPincodes));
    const overlaps = intersect(serviceable.normalized, excluded.normalized);

    if (!form.codEnabled && !form.onlinePaymentEnabled) { toast.error("Keep at least one payment method enabled so customers can complete checkout."); return; }
    if (!isFiniteNumber(form.shippingFee) || shippingFee < 0) { toast.error("Shipping fee must be zero or a positive amount."); return; }
    if (!isFiniteNumber(form.freeShippingThreshold) || freeShippingThreshold < 0) { toast.error("Free-shipping threshold must be zero or a positive amount."); return; }
    if (!isWholeNumber(min) || !isWholeNumber(max) || min < 1 || max < min) { toast.error("Delivery days must be positive whole numbers, with the maximum equal to or greater than the minimum."); return; }
    if (serviceable.invalid.length || excluded.invalid.length) { toast.error(`Every pincode must be a valid six-digit Indian pincode. Check: ${[...serviceable.invalid, ...excluded.invalid].slice(0, 5).join(", ")}`); return; }
    if (!form.serviceAllIndia && serviceable.normalized.length === 0) { toast.error("Add at least one serviceable pincode when all-India delivery is disabled."); return; }
    if (overlaps.length) { toast.error(`The same pincode cannot be both serviceable and excluded. Check: ${overlaps.slice(0, 5).join(", ")}`); return; }

    try { setSaving(true); const payload = { ...form, serviceablePincodes: serviceable.normalized, excludedPincodes: excluded.normalized, shippingFee, freeShippingThreshold, estimatedDaysMin: min, estimatedDaysMax: max }; const { data } = await API.put("/delivery/admin/settings", payload); setForm((current) => ({ ...current, serviceablePincodes: toLines(data.data?.serviceablePincodes ?? serviceable.normalized), excludedPincodes: toLines(data.data?.excludedPincodes ?? excluded.normalized) })); toast.success(data.message || "Delivery settings saved."); }
    catch (error) { toast.error(getErrorMessage(error, "Delivery settings could not be saved.")); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingState label="Loading delivery settings…" className="min-h-[60vh]" />;
  return <div className="space-y-6">
    <PageHeader eyebrow="Checkout operations" title="Delivery and payments" description="These rules are read by both the storefront delivery checker and the server-side order total calculation." actions={<><Button variant="secondary" onClick={load}><RefreshCw size={17} /> Reload</Button><Button onClick={save} disabled={saving}><Save size={17} />{saving ? "Saving…" : "Save settings"}</Button></>} />
    <div className="grid gap-5 xl:grid-cols-2">
      <Card className="p-5"><div className="mb-5 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-800"><Truck size={21} /></div><div><h2 className="font-bold text-stone-950">Shipping charges and timeline</h2><p className="text-xs text-stone-500">Displayed estimates should match your courier operations.</p></div></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Shipping fee"><Input type="number" min="0" step="0.01" value={form.shippingFee} onChange={(event) => setForm((current) => ({ ...current, shippingFee: event.target.value }))} /></Field><Field label="Free shipping above"><Input type="number" min="0" step="0.01" value={form.freeShippingThreshold} onChange={(event) => setForm((current) => ({ ...current, freeShippingThreshold: event.target.value }))} /></Field><Field label="Minimum delivery days"><Input type="number" min="1" step="1" value={form.estimatedDaysMin} onChange={(event) => setForm((current) => ({ ...current, estimatedDaysMin: event.target.value }))} /></Field><Field label="Maximum delivery days"><Input type="number" min="1" step="1" value={form.estimatedDaysMax} onChange={(event) => setForm((current) => ({ ...current, estimatedDaysMax: event.target.value }))} /></Field></div></Card>
      <Card className="p-5"><div className="mb-5 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-copper-50 text-copper-700"><CreditCard size={21} /></div><div><h2 className="font-bold text-stone-950">Payment methods</h2><p className="text-xs text-stone-500">The client should hide methods that are disabled here.</p></div></div><div className="space-y-3"><Toggle checked={form.codEnabled} onChange={(value) => setForm((current) => ({ ...current, codEnabled: value }))} label="Cash on delivery" description="Allow customers to place COD orders where delivery is serviceable." /><Toggle checked={form.onlinePaymentEnabled} onChange={(value) => setForm((current) => ({ ...current, onlinePaymentEnabled: value }))} label="Online payment" description="Allow Razorpay checkout. Live credentials must also be configured on the server." /></div></Card>
    </div>
    <Card className="p-5"><div className="mb-5 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-gold-50 text-gold-700"><MapPin size={21} /></div><div><h2 className="font-bold text-stone-950">Pincode coverage</h2><p className="text-xs text-stone-500">Use one six-digit pincode per line or separate them with commas.</p></div></div><Toggle checked={form.serviceAllIndia} onChange={(value) => setForm((current) => ({ ...current, serviceAllIndia: value }))} label="Serve all Indian pincodes by default" description="Excluded pincodes still remain blocked. Turn this off to allow only the serviceable list." /><div className="mt-5 grid gap-5 lg:grid-cols-2"><Field label="Explicitly serviceable pincodes" hint={form.serviceAllIndia ? "Optional while all-India service is active." : "Only these pincodes will be accepted."}><Textarea rows="8" value={form.serviceablePincodes} onChange={(event) => setForm((current) => ({ ...current, serviceablePincodes: event.target.value }))} placeholder="110001\n302016\n160017" /></Field><Field label="Excluded pincodes" hint="These are always rejected, even when all-India service is enabled."><Textarea rows="8" value={form.excludedPincodes} onChange={(event) => setForm((current) => ({ ...current, excludedPincodes: event.target.value }))} placeholder="Enter non-serviceable pincodes" /></Field></div></Card>
  </div>;
}
