import { useEffect, useState } from "react";
import { MapPin, Trash2 } from "lucide-react";
import Alert from "../components/ui/Alert";
import FormField from "../components/ui/FormField";
import { addressApi, getErrorMessage } from "../services/api";

const blank = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

export default function AddressesPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setList(await addressApi.list());
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load saved addresses."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: name === "pincode" || name === "phone" ? value.replace(/\D/g, "") : value }));
  };

  const save = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await addressApi.create({ ...form, pincode: form.pincode.trim(), phone: form.phone.trim() });
      setForm(blank);
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to save this address."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    setError("");
    try {
      await addressApi.remove(id);
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to delete this address."));
    }
  };

  const makeDefault = async (id) => {
    setError("");
    try {
      await addressApi.setDefault(id);
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to update the default address."));
    }
  };

  return (
    <section className="page-section bg-[#0A0A0C]">
      <div className="container-page">
        <p className="section-eyebrow">Athlete Account</p>
        <h1 className="section-title mt-3">Saved Delivery Addresses</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">Save your shipping address once for 1-click supplement checkout.</p>

        {error && <Alert type="error" className="mt-6">{error}</Alert>}

        <div className="mt-7 grid gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-2">
          <form onSubmit={save} className="order-2 border border-slate-800 bg-[#121216] p-5 shadow-2xl rounded-none sm:p-6 lg:order-1">
            <h2 className="text-xl font-black uppercase text-white">Add Delivery Address</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FormField name="fullName" label="Full Name" value={form.fullName} onChange={update} autoComplete="name" className="sm:col-span-2" required />
              <FormField name="phone" label="Mobile Number" type="tel" inputMode="numeric" maxLength={10} value={form.phone} onChange={update} autoComplete="tel" required />
              <FormField name="pincode" label="Pincode" inputMode="numeric" maxLength={6} value={form.pincode} onChange={update} autoComplete="postal-code" required />
              <FormField name="addressLine1" label="House / Flat, Building & Street" value={form.addressLine1} onChange={update} autoComplete="address-line1" className="sm:col-span-2" required />
              <FormField name="addressLine2" label="Landmark or Area (optional)" value={form.addressLine2} onChange={update} autoComplete="address-line2" className="sm:col-span-2" />
              <FormField name="city" label="City" value={form.city} onChange={update} autoComplete="address-level2" required />
              <FormField name="state" label="State" value={form.state} onChange={update} autoComplete="address-level1" required />
              <FormField name="country" label="Country" value="India" readOnly className="sm:col-span-2" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary mt-6 w-full text-center sm:w-auto">{saving ? "Saving…" : "SAVE ADDRESS"}</button>
          </form>

          <div className="order-1 lg:order-2">
            <h2 className="text-xl font-black uppercase text-white">Your Saved Addresses</h2>
            {loading ? (
              <div className="mt-4 h-40 animate-pulse border border-slate-800 bg-[#121216] rounded-none" />
            ) : list.length ? (
              <div className="mt-4 space-y-3">
                {list.map((address) => {
                  const id = address._id || address.id;
                  return (
                    <article key={id} className="border border-slate-800 bg-[#121216] p-4 shadow-2xl rounded-none sm:p-5">
                      <div className="flex items-start gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center bg-[#1A1A22] text-[#FF5500]"><MapPin size={18} /></span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-white">{address.fullName}</p>
                            {address.isDefault && <span className="bg-[#FF5500] px-2.5 py-0.5 text-[10px] font-black uppercase text-black">Default</span>}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}<br />
                            {address.city}, {address.state} {address.pincode}<br />
                            {address.phone}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-800 pt-4">
                        {!address.isDefault && <button type="button" className="min-h-10 text-sm font-bold text-[#FFB800] hover:underline" onClick={() => makeDefault(id)}>Make Default</button>}
                        <button type="button" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-red-500 hover:text-red-400" onClick={() => remove(id)}><Trash2 size={15} /> Delete</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 border border-dashed border-slate-800 bg-[#121216] p-6 text-center text-sm text-slate-400 rounded-none sm:p-8">No saved addresses yet.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
