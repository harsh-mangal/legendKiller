import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Alert from "../components/ui/Alert";
import FormField from "../components/ui/FormField";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";
import { safeInternalPath } from "../utils/routing";
import { isValidEmail } from "../utils/validation";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, requestOtp, loginWithOtp, isLoggedIn, authLoading } = useAuth();
  const [mode, setMode] = useState("password");
  const [form, setForm] = useState({ email: "", password: "", otp: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const redirectTo = useMemo(
    () => safeInternalPath(location.state?.from, "/profile"),
    [location.state]
  );

  useEffect(() => {
    if (location.state?.registered) {
      setForm((current) => ({ ...current, email: location.state.email || current.email }));
      setStatus({ type: "success", message: "Your account was created. Log in to continue." });
    }
  }, [location.state]);

  useEffect(() => {
    if (!authLoading && isLoggedIn) navigate(redirectTo, { replace: true });
  }, [authLoading, isLoggedIn, navigate, redirectTo]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    if (!isValidEmail(form.email)) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setLoading(true);
    try {
      if (mode === "password") {
        if (!form.password) throw new Error("Please enter your password.");
        await login({ email: form.email.trim().toLowerCase(), password: form.password });
      } else {
        if (!/^\d{4,8}$/.test(form.otp.trim())) throw new Error("Please enter the OTP sent to your email.");
        await loginWithOtp({ email: form.email.trim().toLowerCase(), otp: form.otp.trim() });
      }
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setStatus({ type: "error", message: getErrorMessage(error, "Login failed. Please check your details.") });
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    if (otpSending || cooldown > 0) return;
    setStatus({ type: "", message: "" });
    if (!isValidEmail(form.email)) {
      setStatus({ type: "error", message: "Enter a valid email address before requesting an OTP." });
      return;
    }

    setOtpSending(true);
    try {
      await requestOtp({ email: form.email.trim().toLowerCase() });
      setMode("otp");
      setCooldown(60);
      setStatus({ type: "success", message: "OTP sent. Check your email and enter it below." });
    } catch (error) {
      setStatus({ type: "error", message: getErrorMessage(error, "Unable to send the OTP.") });
    } finally {
      setOtpSending(false);
    }
  };

  return (
    <section className="page-section bg-[#0A0A0C]">
      <div className="container-page max-w-md">
        <form onSubmit={submit} className="border border-slate-800 bg-[#121216] p-5 shadow-2xl rounded-none sm:p-8">
          <p className="section-eyebrow">Welcome Back</p>
          <h1 className="mt-3 text-3xl font-black uppercase text-white">Log In</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">Log in to continue shopping, follow your orders, manage saved addresses and access eligible Viper Coins.</p>

          <div className="mt-7 flex rounded-none border border-slate-800 bg-[#0A0A0C] p-1">
            <button type="button" onClick={() => setMode("password")} className={`flex-1 rounded-none px-3 py-2 text-sm font-black uppercase transition ${mode === "password" ? "bg-[#FF5500] text-black shadow-sm" : "text-slate-400"}`}>Password</button>
            <button type="button" onClick={() => setMode("otp")} className={`flex-1 rounded-none px-3 py-2 text-sm font-black uppercase transition ${mode === "otp" ? "bg-[#FF5500] text-black shadow-sm" : "text-slate-400"}`}>Email OTP</button>
          </div>

          <div className="mt-6 space-y-4">
            <FormField name="email" label="Email address" type="email" autoComplete="email" value={form.email} onChange={update} required />
            {mode === "password" ? (
              <FormField name="password" label="Password" type="password" autoComplete="current-password" value={form.password} onChange={update} required />
            ) : (
              <FormField name="otp" label="Email OTP" inputMode="numeric" autoComplete="one-time-code" value={form.otp} onChange={update} required hint="Enter the code sent to your email." />
            )}

            {status.message && <Alert type={status.type || "info"}>{status.message}</Alert>}

            <button type="submit" disabled={loading} className="btn-primary w-full text-center">
              {loading ? "Signing in…" : mode === "password" ? "LOG IN" : "VERIFY OTP & LOG IN"}
            </button>

            {mode === "otp" && (
              <button type="button" onClick={sendOtp} disabled={otpSending || cooldown > 0} className="btn-outline w-full text-center">
                {otpSending ? "Sending OTP…" : cooldown > 0 ? `Resend OTP in ${cooldown}s` : "SEND OTP TO EMAIL"}
              </button>
            )}

            {mode === "password" && (
              <button type="button" onClick={() => navigate("/forgot-password")} className="w-full text-sm font-bold text-[#FFB800] hover:underline">
                Forgot your password? Reset it securely
              </button>
            )}

            <p className="text-center text-sm text-slate-300">
              New athlete?{" "}
              <Link to="/register" state={{ from: redirectTo }} className="font-bold text-[#FFB800] hover:underline">Join Legend Killer</Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
