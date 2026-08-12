import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Alert from "../components/ui/Alert";
import FormField from "../components/ui/FormField";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";
import { safeInternalPath } from "../utils/routing";
import { isValidEmail, isValidIndianPhone, normalizePhone } from "../utils/validation";

export default function RegisterPage() {
  const { register, isLoggedIn, authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = safeInternalPath(location.state?.from, "/profile");

  useEffect(() => {
    if (!authLoading && isLoggedIn) navigate(redirectTo, { replace: true });
  }, [authLoading, isLoggedIn, navigate, redirectTo]);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Please enter your full name.");
    if (!isValidEmail(form.email)) return setError("Please enter a valid email address.");
    if (!isValidIndianPhone(form.phone)) return setError("Please enter a valid 10-digit Indian mobile number.");
    if (form.password.length < 8) return setError("Password must contain at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const email = form.email.trim().toLowerCase();
      const result = await register({
        name: form.name.trim(),
        email,
        phone: normalizePhone(form.phone),
        password: form.password,
      });
      if (result.authenticated) navigate(redirectTo, { replace: true });
      else navigate("/login", { replace: true, state: { from: redirectTo, registered: true, email } });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section bg-[#0A0A0C]">
      <div className="container-page max-w-lg">
        <form onSubmit={submit} className="border border-slate-800 bg-[#121216] p-5 shadow-2xl rounded-none sm:p-8">
          <p className="section-eyebrow">Join Legend Killer</p>
          <h1 className="mt-3 text-3xl font-black uppercase text-white">Create Your Free Account</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">Save delivery addresses, track supplement shipments, and earn Viper Coins on every order.</p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <FormField name="name" label="Full Name" value={form.name} onChange={update} autoComplete="name" className="sm:col-span-2" required />
            <FormField name="email" label="Email Address" type="email" value={form.email} onChange={update} autoComplete="email" required />
            <FormField name="phone" label="Mobile Number" type="tel" value={form.phone} onChange={update} autoComplete="tel" required />
            <FormField name="password" label="Password" type="password" value={form.password} onChange={update} autoComplete="new-password" hint="Use at least 8 characters." required />
            <FormField name="confirmPassword" label="Confirm Password" type="password" value={form.confirmPassword} onChange={update} autoComplete="new-password" required />
          </div>

          {error && <Alert type="error" className="mt-5">{error}</Alert>}
          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full text-center">{loading ? "Creating Account…" : "JOIN LEGEND KILLER"}</button>
          <p className="mt-5 text-center text-sm text-slate-300">Already have an account? <Link to="/login" state={{ from: redirectTo }} className="font-bold text-[#FFB800] hover:underline">Log in</Link></p>
        </form>
      </div>
    </section>
  );
}
