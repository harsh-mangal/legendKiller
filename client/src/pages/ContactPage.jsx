import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import Alert from "../components/ui/Alert";
import FormField from "../components/ui/FormField";
import { SITE } from "../config/site";
import { contactApi, getErrorMessage } from "../services/api";

function ContactInfo({ icon: Icon, title, value, href }) {
  const content = (
    <div className="flex items-center gap-3.5 border border-slate-800 bg-[#121216] p-4 rounded-none shadow-md">
      <div className="grid h-10 w-10 shrink-0 place-items-center bg-[#1A1A22] text-[#FF5500]">
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-wider text-[#FFB800]">{title}</p>
        <p className="truncate text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href} className="block transition hover:brightness-110">{content}</a> : content;
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const response = await contactApi.sendMessage(form);
      setStatus({ type: "success", message: response.message || "Your message has been received. Our team will contact you shortly." });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (requestError) {
      setStatus({ type: "error", message: getErrorMessage(requestError, "Message could not be submitted. Please try again.") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section bg-[#0A0A0C]">
      <div className="container-page grid gap-8 sm:gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="section-eyebrow">Athlete Support</p>
          <h1 className="section-title mt-3">Get In Touch</h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-300 sm:mt-5 sm:text-base sm:leading-8">
            Contact us for supplement guidance, order tracking, express shipping, dosage advice, or wholesale business enquiries.
          </p>

          <div className="mt-7 space-y-3 sm:mt-8 sm:space-y-4">
            <ContactInfo icon={Phone} title="Phone" value={SITE.supportPhoneDisplay} href={`tel:${SITE.supportPhoneHref}`} />
            <ContactInfo icon={Mail} title="Email" value={SITE.supportEmail} href={`mailto:${SITE.supportEmail}`} />
            <ContactInfo icon={MapPin} title="Location" value={SITE.location} />
          </div>

          <div className="mt-7 border border-slate-800 bg-[#121216] p-4 shadow-2xl rounded-none sm:mt-8 sm:p-5">
            <p className="text-xs font-black uppercase tracking-wider text-[#FFB800]">Support Protocol</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              For active order questions, please include your order ID in your message for accelerated support.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="border border-slate-800 bg-[#121216] p-5 shadow-2xl rounded-none sm:p-8">
          <p className="text-xs font-black uppercase tracking-wider text-[#FFB800]">Send a Message</p>
          <h2 className="mt-1 text-2xl font-black uppercase text-white">How Can We Help You?</h2>

          <div className="mt-6 space-y-4">
            <FormField name="name" label="Your Name" value={form.name} onChange={update} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField name="email" label="Email Address" type="email" value={form.email} onChange={update} required />
              <FormField name="phone" label="Phone Number" type="tel" value={form.phone} onChange={update} />
            </div>
            <FormField name="subject" label="Subject / Order ID" value={form.subject} onChange={update} required />
            <FormField name="message" label="Message" as="textarea" rows={4} value={form.message} onChange={update} required />

            {status.message && <Alert type={status.type || "info"}>{status.message}</Alert>}

            <button type="submit" disabled={loading} className="btn-primary w-full text-center">
              <Send size={16} /> {loading ? "Sending Message…" : "SUBMIT MESSAGE"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
