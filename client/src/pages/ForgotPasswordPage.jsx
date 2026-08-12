import { useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/ui/Alert";
import FormField from "../components/ui/FormField";
import { authApi, getErrorMessage } from "../services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await authApi.forgotPassword({ email: email.trim().toLowerCase() });
      setStatus({ type: "success", message: "If an account exists, reset instructions have been sent to your email." });
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
          <h1 className="mt-3 text-3xl font-black uppercase text-white">Reset Password</h1>
          <p className="mt-3 text-sm text-slate-300">We will send a secure reset link or OTP to your registered email address.</p>
          <div className="mt-6">
            <FormField label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {status && <Alert type={status.type} className="mt-5">{status.message}</Alert>}
          <button disabled={loading} className="btn-primary mt-6 w-full text-center">{loading ? "Sending…" : "SEND RESET INSTRUCTIONS"}</button>
          <Link to="/login" className="mt-5 block text-center text-sm font-bold text-[#FFB800] hover:underline">Back to Log In</Link>
        </form>
      </div>
    </section>
  );
}
