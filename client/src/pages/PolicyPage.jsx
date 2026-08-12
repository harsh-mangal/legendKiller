import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const policies = {
  privacy: {
    eyebrow: "Legal & Privacy",
    title: "Privacy Policy",
    updated: "1 August 2026",
    intro: "This policy explains how Legend Killer collects, uses, stores, and protects information when you browse our website, create an account, contact us, or place an order.",
    sections: [
      ["Information We Collect", ["Account and contact information such as your name, phone number, email address, and delivery address.", "Order, payment status, supplement preferences, and customer support history.", "Technical information such as device type, browser, IP address, and security analytics."]],
      ["How We Use Information", ["To process, fulfill, deliver, and support your sports nutrition orders.", "To provide account services, order updates, customer support, refunds, and service communications.", "To prevent fraud, maintain website security, improve our performance range, and meet legal or regulatory obligations."]],
      ["Payments", ["Payments are securely processed by authorized third-party payment providers (e.g. Razorpay). We do not store complete card, UPI PIN, or banking credentials."]],
      ["Sharing and Retention", ["We share necessary information only with logistics partners, payment processors, cloud hosting, and professional advisers.", "Information is retained only as required for order fulfillment, accounting, security, and statutory compliance."]],
      ["Your Rights", ["You may request access, correction, or deletion of eligible personal data by contacting us. Certain records may be retained as mandated by law."]],
      ["Security", ["We enforce administrative and technical encryption safeguards. Customers should keep account credentials private."]],
    ],
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms & Conditions",
    updated: "1 August 2026",
    intro: "These terms govern your use of the Legend Killer platform and supplement purchases. By placing an order, you agree to these terms.",
    sections: [
      ["Platform Use", ["You must provide accurate account information and use the platform for lawful supplement purchases.", "You are responsible for safeguarding your account and notifying us of any unauthorized activity."]],
      ["Product & Supplement Information", ["We display supplement macros, ingredients, prices, and availability accurately. Tub packaging or label designs may vary slightly across batches.", "Product information is intended for training and fitness guidance and does not replace medical advice."]],
      ["Order Acceptance", ["Order receipts do not guarantee order acceptance. We reserve the right to cancel orders in case of stock errors or payment verification issues.", "Any collected payments for canceled orders will be refunded per our refund policy."]],
      ["Pricing & Payment", ["Prices are subject to change without prior notice. Accepted orders will be fulfilled at the confirmed order value."]],
      ["Liability", ["Liability is limited to direct losses connected to the affected supplement order."]],
      ["Governing Law", ["These terms are governed by the laws of India and applicable consumer protection statutes."]],
    ],
  },
  shipping: {
    eyebrow: "Delivery Protocol",
    title: "Shipping Policy",
    updated: "1 August 2026",
    intro: "We process and dispatch confirmed supplement orders via express courier partners with live tracking across India.",
    sections: [
      ["Order Processing", ["Orders are dispatched after payment verification and pincode serviceability checks.", "Processing may take longer during major sales, new product drops, or national holidays."]],
      ["Delivery Timelines", ["Delivery estimates shown at checkout are estimated ranges depending on location and courier coverage."]],
      ["Shipping Charges", ["Applicable delivery fees or promotional free shipping thresholds are displayed at checkout."]],
      ["Delivery Attempts", ["Ensure a complete address and reachable mobile number for delivery agents."]],
      ["Damaged Shipments", ["Report damaged packaging or tampered seals immediately with an unboxing video for rapid replacement."]],
    ],
  },
  returns: {
    eyebrow: "Athlete Care",
    title: "Returns & Refund Policy",
    updated: "1 August 2026",
    intro: "Due to strict hygiene, seal integrity, and anti-counterfeiting protocols, supplement return eligibility depends on tub condition and seal verification.",
    sections: [
      ["Eligible Cases", ["You received an incorrect item.", "The supplement arrived damaged, leaking, unsealed, or expired.", "A verified item is missing from the parcel."]],
      ["Non-Returnable Cases", ["Opened, broken outer seals, consumed, or altered supplement tubs cannot be returned for hygiene and safety reasons.", "Personal flavor preferences or mind changes after seal removal do not constitute product defects."]],
      ["Support Requests", ["Contact Athlete Support with your order number, photos, and unboxing video."]],
      ["Refunds", ["Approved refunds are credited to the original payment method."]],
    ],
  },
  cancellation: {
    eyebrow: "Order Support",
    title: "Cancellation Policy",
    updated: "1 August 2026",
    intro: "Orders can be canceled prior to dispatch directly from your account dashboard or by contacting Athlete Support.",
    sections: [
      ["Before Dispatch", ["Orders can be canceled before warehouse packing and handover."]],
      ["After Dispatch", ["Dispatched shipments cannot be canceled in transit. Eligible concerns are handled under our Returns Policy."]],
    ],
  },
  disclaimer: {
    eyebrow: "Important Information",
    title: "Health & Supplement Disclaimer",
    updated: "1 August 2026",
    intro: "Legend Killer supplements are intended for healthy adults, bodybuilders, and fitness enthusiasts to support training goals. They do not diagnose, treat, or cure diseases.",
    sections: [
      ["Professional Guidance", ["Consult a physician or certified fitness coach before beginning any intense supplement or workout regimen.", "Not recommended for pregnant or lactating women, or individuals under 18 unless advised by a healthcare provider."]],
      ["Individual Variation", ["Individual muscle growth and endurance outcomes depend on exercise intensity, diet, sleep, and metabolic factors."]],
      ["Safe Usage", ["Always check the scratch code for authenticity. Read scoop sizes, directions, and warnings before consuming."]],
    ],
  },
};

export default function PolicyPage() {
  const { policy } = useParams();
  const page = policies[policy];

  if (!page) {
    return (
      <section className="py-20 bg-[#0A0A0C]">
        <div className="container-page max-w-3xl text-center">
          <h1 className="section-title">Policy Not Found</h1>
          <Link to="/" className="btn-primary mt-8">Return Home</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#0A0A0C] py-12 sm:py-16 lg:py-20">
      <div className="container-page max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase text-slate-300 transition hover:text-[#FFB800]">
          <ArrowLeft size={16} /> Back to Store
        </Link>

        <header className="mt-8 border-b border-slate-800 pb-9">
          <p className="section-eyebrow">{page.eyebrow}</p>
          <h1 className="section-title mt-3">{page.title}</h1>
          <p className="mt-4 text-sm text-slate-400">Effective Date: {page.updated}</p>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-200">{page.intro}</p>
        </header>

        <div className="divide-y divide-slate-800">
          {page.sections.map(([heading, items]) => (
            <section key={heading} className="py-8">
              <h2 className="text-xl font-black uppercase text-white">{heading}</h2>
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm leading-7 text-slate-200 sm:text-base">
                    <CheckCircle2 className="mt-1 shrink-0 text-[#FF5500]" size={17} />
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 border border-slate-800 bg-[#121216] p-6 text-sm leading-7 text-slate-300">
          Questions regarding this policy? Submit a ticket via our <Link to="/contact" className="font-bold text-[#FFB800] underline underline-offset-4">Athlete Support Page</Link>. Include your order ID for faster processing.
        </div>
      </div>
    </section>
  );
}
