import { useCallback, useEffect, useState } from "react";
import { Coins, RefreshCw, Save, WalletCards } from "lucide-react";
import API from "../api/axios";
import { Button, Card, Field, Input, LoadingState, PageHeader, Select, Toggle } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/errors";
import { isFiniteNumber } from "../utils/validation";

const blank = { earnEnabled: true, redeemEnabled: true, earnPercentage: "5", coinValueInRupees: "1", maxRedeemPercentage: "20", applyOn: "ORDER_VALUE" };
export default function CoinSettings() {
  const [form, setForm] = useState(blank); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const toast = useToast();
  const load = useCallback(async () => { try { setLoading(true); const { data } = await API.get("/amyeka-coins/setting"); const value = data.data || {}; setForm({ ...blank, ...value, earnPercentage: String(value.earnPercentage ?? 5), coinValueInRupees: String(value.coinValueInRupees ?? 1), maxRedeemPercentage: String(value.maxRedeemPercentage ?? 20) }); } catch (error) { toast.error(getErrorMessage(error, "Viper Coin settings could not be loaded.")); } finally { setLoading(false); } }, [toast]);
  useEffect(() => { load(); }, [load]);
  const save = async () => {
    const earnPercentage = Number(form.earnPercentage);
    const coinValueInRupees = Number(form.coinValueInRupees);
    const maxRedeemPercentage = Number(form.maxRedeemPercentage);
    if (!isFiniteNumber(form.earnPercentage) || earnPercentage < 0 || earnPercentage > 100) { toast.error("Earn percentage must be between 0 and 100."); return; }
    if (!isFiniteNumber(form.coinValueInRupees) || coinValueInRupees < 0.01 || coinValueInRupees > 1000) { toast.error("Coin value must be between ₹0.01 and ₹1,000."); return; }
    if (!isFiniteNumber(form.maxRedeemPercentage) || maxRedeemPercentage < 0 || maxRedeemPercentage > 100) { toast.error("Maximum redemption must be between 0 and 100%."); return; }
    if (form.redeemEnabled && maxRedeemPercentage === 0) { toast.error("Set a redemption percentage above zero or disable coin redemption."); return; }
    if (form.earnEnabled && earnPercentage === 0) { toast.error("Set an earning percentage above zero or disable coin earning."); return; }
    try {
      setSaving(true);
      const payload = { ...form, earnPercentage, coinValueInRupees, maxRedeemPercentage };
      const { data } = await API.put("/amyeka-coins/setting", payload);
      const value = data.data || payload;
      setForm((current) => ({ ...current, ...value, earnPercentage: String(value.earnPercentage), coinValueInRupees: String(value.coinValueInRupees), maxRedeemPercentage: String(value.maxRedeemPercentage) }));
      toast.success(data.message || "Viper Coin settings saved successfully.");
    } catch (error) { toast.error(getErrorMessage(error, "Viper Coin settings could not be saved.")); }
    finally { setSaving(false); }
  };
  if (loading) return <LoadingState label="Loading Viper Coin settings…" className="min-h-[60vh]" />;
  return <div className="space-y-6"><PageHeader eyebrow="Legend Customer Loyalty" title="Viper Coins Protocol" description="Manage how Viper Coins are earned and redeemed on Legend Killer orders." actions={<><Button variant="secondary" onClick={load}><RefreshCw size={17} /> Reload</Button><Button onClick={save} disabled={saving}><Save size={17} />{saving ? "Saving…" : "Save Settings"}</Button></>} />
    <div className="grid gap-5 xl:grid-cols-[1fr_0.7fr]"><Card className="p-5"><div className="mb-5 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/10 text-[#FFB800]"><Coins size={21} /></div><div><h2 className="font-bold text-white">Earning & Redemption Rules</h2><p className="text-xs text-slate-400">Configure reward coin percentages and redemption caps for customers.</p></div></div><div className="space-y-3"><Toggle checked={form.earnEnabled} onChange={(value) => setForm((current) => ({ ...current, earnEnabled: value }))} label="Allow customers to earn Viper Coins" description="Coins are automatically credited when eligible supplement orders are delivered." /><Toggle checked={form.redeemEnabled} onChange={(value) => setForm((current) => ({ ...current, redeemEnabled: value }))} label="Allow Viper Coin redemption" description="Customers can apply available Viper Coins at checkout." /></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Earn percentage"><Input type="number" min="0" max="100" step="0.01" value={form.earnPercentage} onChange={(event) => setForm((current) => ({ ...current, earnPercentage: event.target.value }))} /></Field><Field label="1 coin value in rupees"><Input type="number" min="0.01" step="0.01" value={form.coinValueInRupees} onChange={(event) => setForm((current) => ({ ...current, coinValueInRupees: event.target.value }))} /></Field><Field label="Maximum redeem percentage"><Input type="number" min="0" max="100" step="0.01" value={form.maxRedeemPercentage} onChange={(event) => setForm((current) => ({ ...current, maxRedeemPercentage: event.target.value }))} /></Field><Field label="Earning basis"><Select value={form.applyOn} onChange={(event) => setForm((current) => ({ ...current, applyOn: event.target.value }))}><option value="ORDER_VALUE">Final order value</option><option value="CART_VALUE">Items value before shipping</option></Select></Field></div></Card>
    <Card className="p-5"><div className="grid h-12 w-12 place-items-center rounded-xl bg-[#FF5500]/10 text-[#FF5500]"><WalletCards size={23} /></div><h2 className="mt-5 text-lg font-bold text-white">Customer-Facing Example</h2><p className="mt-2 text-sm leading-6 text-slate-300">On a ₹1,000 order, a {form.earnPercentage || 0}% earning rule awards <strong>{Math.floor(Number(form.earnPercentage || 0) * 10)} Viper Coins</strong>. At ₹{form.coinValueInRupees || 0} per coin, the redemption discount value is ₹{(Math.floor(Number(form.earnPercentage || 0) * 10) * Number(form.coinValueInRupees || 0)).toFixed(2)}.</p><div className="mt-5 rounded-xl border border-[#FF5500]/30 bg-[#121216] p-4 text-xs leading-5 text-[#FFB800]">Changing coin rules affects new order calculations. Existing wallet balances remain secure on the server.</div></Card></div>
  </div>;
}
