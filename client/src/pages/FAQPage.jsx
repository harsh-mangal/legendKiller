import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { FAQ_ENTRIES } from "../content/faq";

export default function FAQPage() {
  const [open, setOpen] = useState(0);

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container-page max-w-4xl">
        <div className="max-w-2xl">
          <p className="section-eyebrow">Help centre</p>
          <h1 className="section-title mt-3">Questions Indian shoppers often ask</h1>
          <p className="mt-4 text-[15px] leading-7 text-slate-600 sm:mt-5 sm:text-base sm:leading-8">Simple answers about choosing products, COD and online payments, Indian pincode delivery, returns, refunds and responsible use.</p>
        </div>

        <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200 sm:mt-10">
          {FAQ_ENTRIES.map(([question, answer], index) => {
            const active = open === index;
            return (
              <div key={question}>
                <button type="button" onClick={() => setOpen(active ? -1 : index)} className="flex min-h-16 w-full items-center justify-between gap-4 py-4 text-left sm:gap-5 sm:py-6" aria-expanded={active}>
                  <span className="text-sm font-semibold leading-6 text-slate-950 sm:text-base">{question}</span>
                  <ChevronDown size={20} className={`shrink-0 text-slate-500 transition ${active ? "rotate-180" : ""}`} />
                </button>
                {active && <p className="max-w-3xl pb-5 text-sm leading-7 text-slate-600 sm:pb-6 sm:text-base">{answer}</p>}
              </div>
            );
          })}
        </div>

        <div className="mt-8 border border-slate-200 bg-slate-50 p-4 sm:mt-10 sm:rounded-[6px] sm:p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Still have a sawaal?</h2>
            <p className="mt-1 text-sm text-slate-600">Send us your product or order question and our team will help.</p>
          </div>
          <Link to="/contact" className="btn-primary mt-5 w-full sm:mt-0 sm:w-auto">Ask Legend Support</Link>
        </div>
      </div>
    </section>
  );
}
