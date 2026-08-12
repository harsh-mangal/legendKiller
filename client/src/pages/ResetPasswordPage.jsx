import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Alert from "../components/ui/Alert";
import FormField from "../components/ui/FormField";
import { authApi, getErrorMessage } from "../services/api";

export default function ResetPasswordPage() {
  const [q] = useSearchParams();
  const token = q.get("token") || "";
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return setStatus({ type: "error", message: "Password must be at least 8 characters." });
    if (form.password !== form.confirm) return setStatus({ type: "error", message: "Passwords do not match." });
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password: form.password });
      setStatus({ type: "success", message: "Password updated successfully. You can now log in." });
    } catch (err) {
      setStatus({ type: "error", message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section bg-[#0A0A0C]">
      <div className="container-page max-w-md">
        <form onSubmit={submit} className="border border-slate-800 bg-[#121216] p-6 shadow-2xl rounded-none sm:p-8">
          <p className="section-eyebrow">Account Recovery</p>
          <h1 className="mt-3 text-3xl font-black uppercase text-white">Choose New Password</h1>
          <div className="mt-6 space-y-4">
            <FormField label="New password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <FormField label="Confirm password" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          </div>
          {status && <Alert type={status.type} className="mt-5">{status.message}</Alert>}
          <button disabled={loading || !token} className="btn-primary mt-6 w-full text-center">{loading ? "Updating…" : "UPDATE PASSWORD"}</button>
          <Link to="/login" className="mt-5 block text-center text-sm font-bold text-[#FFB800] hover:underline">Return to Log In</Link>
        </form>
      </div>
    </section>
  );
}
