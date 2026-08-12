import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Field, Input } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/errors";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestedNext = params.get("next") || "/";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";

  useEffect(() => { if (!loading && isAuthenticated) navigate(next, { replace: true }); }, [isAuthenticated, loading, navigate, next]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      await login({ email: form.email.trim(), password: form.password });
      toast.success("Welcome back. Legend Killer admin session verified.");
      navigate(next, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to sign in."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-slate-900 border-r border-slate-200 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-32 -top-24 h-96 w-96 rounded-full border border-white/10" />
        <div className="absolute -bottom-48 -left-16 h-[520px] w-[520px] rounded-full bg-[#FF5500]/20 blur-3xl" />
        <div className="relative flex items-center gap-4"><img src="/admin-logo.png" alt="Legend Killer" className="h-16 w-40 rounded-none bg-black object-contain px-2 border border-slate-700" /><div><p className="text-xl font-black uppercase text-[#FFB800]">Legend Killer</p><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5500]">Operations Portal</p></div></div>
        <div className="relative max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFB800]">Operations & Control Center</p><h1 className="mt-4 text-5xl font-black uppercase leading-tight text-white">Dominate Orders, Products & Viper Coins.</h1><p className="mt-5 max-w-lg text-base leading-7 text-slate-300">Live operational control center for Legend Killer protein supplements, stock reservations, order tracking, and customer loyalty.</p></div>
        <div className="relative flex items-center gap-3 text-sm text-slate-300"><ShieldCheck className="text-[#FFB800]" size={20} /> Protected Administrator Access</div>
      </section>
      <section className="grid place-items-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><img src="/admin-logo.png" alt="Legend Killer" className="h-16 w-40 rounded-none bg-slate-900 object-contain px-2 border border-slate-200 shadow-sm" /></div>
          <p className="page-eyebrow">Administrator Sign In</p>
          <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-slate-900">Operations Portal</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Sign in with an account having <strong>ADMIN</strong> role permissions.</p>
          <form onSubmit={submit} className="mt-8 space-y-5 rounded-none border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <Field label="Admin Email" required><div className="relative"><Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><Input type="email" autoComplete="email" className="pl-10" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="admin@legendkiller.com" required /></div></Field>
            <Field label="Password" required><div className="relative"><LockKeyhole size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><Input type={showPassword ? "text" : "password"} autoComplete="current-password" className="pl-10 pr-11" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Enter your password" required /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-none p-2 text-slate-400 hover:bg-slate-100" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></Field>
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>{submitting ? <><Loader2 size={18} className="animate-spin" /> Signing in…</> : "Sign In Securely"}</Button>
          </form>
          <p className="mt-5 text-center text-xs leading-5 text-slate-500">This operations portal is restricted to authorized personnel.</p>
        </div>
      </section>
    </main>
  );
}
