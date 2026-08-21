import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, Award, FileCheck2, Zap, ArrowRight } from "lucide-react";
import { productApi, getErrorMessage } from "../services/api";
import { money, formatDate } from "../utils/format";
import { generateBarcodeSvg } from "../utils/barcode";

export default function ProductVerifyPage() {
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const verify = async () => {
      if (!code) {
        setError("No verification code provided in URL.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await productApi.verifyByCode(code);
        if (active) {
          if (res.isGenuine && res.data) {
            setData(res.data);
          } else {
            setError(res.message || "Authenticity verification failed. Code not found.");
          }
        }
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err, "Verification failed. Product code is not registered in official database."));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    verify();
    return () => { active = false; };
  }, [code]);

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-[#0A0A0C] px-4 py-16 text-white">
        <div className="text-center">
          <div className="relative mx-auto h-20 w-20">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#FF5500]/20" />
            <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-[#FF5500] bg-[#121216] text-[#FF5500]">
              <ShieldCheck size={40} className="animate-pulse" />
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-black uppercase tracking-wider text-white">Authenticating Product Protocol</h2>
          <p className="mt-2 text-sm text-slate-400">Verifying security certificate & lab seals for code: <span className="font-mono text-[#FFB800]">{code}</span></p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <section className="page-section bg-[#0A0A0C]">
        <div className="container-page max-w-2xl text-center">
          <div className="border border-red-900/50 bg-[#121216] p-8 shadow-2xl rounded-none">
            <div className="mx-auto grid h-20 w-20 place-items-center bg-red-950/80 text-red-500 rounded-none border border-red-800">
              <AlertTriangle size={44} />
            </div>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-red-500">Security Warning</p>
            <h1 className="mt-2 text-3xl font-black uppercase text-white">Authentication Failed</h1>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              The code <span className="font-mono font-bold text-red-400 bg-black px-2 py-1">{code || "N/A"}</span> was not found in the official Legend Killer product authentication registry.
            </p>
            <div className="mt-6 border-t border-slate-800 pt-6 text-xs text-slate-400 leading-5">
              <p className="font-bold text-white">Suspect Counterfeit Product?</p>
              <p className="mt-1">Only purchase Legend Killer supplements from our official webstore or verified authorized dealers to guarantee 100% genuine formulation.</p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/products" className="btn-primary">EXPLORE GENUINE PRODUCTS</Link>
              <Link to="/contact" className="btn-outline">REPORT COUNTERFEIT</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section bg-[#0A0A0C]">
      <div className="container-page max-w-4xl">
        {/* Certified Genuine Header Card */}
        <div className="relative overflow-hidden border-2 border-[#FF5500] bg-gradient-to-b from-[#181820] to-[#121216] p-6 shadow-2xl rounded-none sm:p-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#FF5500]/10 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start sm:gap-6">
            <div className="grid h-20 w-20 shrink-0 place-items-center border border-emerald-500/50 bg-emerald-950/80 text-emerald-400 shadow-lg shadow-emerald-950/50">
              <CheckCircle2 size={48} />
            </div>
            <div className="mt-4 sm:mt-0 flex-1">
              <div className="inline-flex items-center gap-2 bg-emerald-950 border border-emerald-700/60 px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] text-emerald-400">
                <ShieldCheck size={15} /> 100% Genuine & Original Legend Killer Product
              </div>
              <h1 className="mt-3 text-2xl font-black uppercase tracking-tight text-white sm:text-4xl">AUTHENTICATED SUPPLEMENT</h1>
              <p className="mt-2 text-sm text-slate-300">
                This item has passed security verification scan <span className="font-bold text-[#FFB800]">#{data.verificationCount || 1}</span> on {data.lastVerifiedAt ? formatDate(data.lastVerifiedAt) : "Today"}.
              </p>
            </div>
          </div>

          {/* Product Highlights Grid */}
          <div className="mt-8 grid gap-6 border-t border-slate-800 pt-8 lg:grid-cols-[220px_1fr]">
            <div className="flex items-center justify-center border border-slate-800 bg-[#0A0A0C] p-4">
              <img
                src={data.images?.[0] || "/placeholder.png"}
                alt={data.name}
                className="max-h-48 w-full object-contain"
              />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#FFB800]">Official Product</p>
                <h2 className="text-2xl font-black uppercase text-white">{data.name}</h2>
                <p className="mt-1 text-xs text-slate-400">SKU: <span className="font-mono text-white">{data.sku}</span> | Auth Code: <span className="font-mono text-[#FFB800]">{data.authenticityCode}</span></p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="border border-slate-800 bg-[#1A1A22] p-3">
                  <p className="font-bold uppercase text-slate-400">Category</p>
                  <p className="mt-0.5 font-black text-white">{data.category?.name || "Sports Nutrition"}</p>
                </div>
                <div className="border border-slate-800 bg-[#1A1A22] p-3">
                  <p className="font-bold uppercase text-slate-400">Price / MRP</p>
                  <p className="mt-0.5 font-black text-[#FFB800]">{money(data.price)} <span className="text-slate-500 line-through text-[10px]">{money(data.mrp)}</span></p>
                </div>
              </div>

              {data.shortDescription && (
                <p className="text-xs leading-5 text-slate-300">{data.shortDescription}</p>
              )}
            </div>
          </div>

          {/* Lab Test & Quality Seals */}
          <div className="mt-8 grid gap-4 border-t border-slate-800 pt-8 sm:grid-cols-3">
            <div className="border border-slate-800 bg-[#1A1A22] p-4 text-center">
              <Award className="mx-auto text-[#FFB800]" size={24} />
              <p className="mt-2 text-xs font-black uppercase text-white">0% Amino Spiking</p>
              <p className="mt-1 text-[11px] leading-4 text-slate-400">100% Pure WPC / WPI formulation verified by NABL lab testing.</p>
            </div>
            <div className="border border-slate-800 bg-[#1A1A22] p-4 text-center">
              <FileCheck2 className="mx-auto text-emerald-400" size={24} />
              <p className="mt-2 text-xs font-black uppercase text-white">Banned Substance Free</p>
              <p className="mt-1 text-[11px] leading-4 text-slate-400">Screened for heavy metals, steroids, and illegal stimulants.</p>
            </div>
            <div className="border border-slate-800 bg-[#1A1A22] p-4 text-center">
              <Zap className="mx-auto text-[#FF5500]" size={24} />
              <p className="mt-2 text-xs font-black uppercase text-white">FSSAI Certified</p>
              <p className="mt-1 text-[11px] leading-4 text-slate-400">Licence #{data.licenceNumber || "10020022001234"}</p>
            </div>
          </div>

          {/* Manufacturer & Compliance Info */}
          <div className="mt-6 border border-slate-800 bg-[#1A1A22] p-4 text-xs text-slate-300">
            <p className="font-black uppercase text-[#FFB800]">Compliance & Origin Record</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <p><strong className="text-white">Manufacturer:</strong> {data.manufacturerName}</p>
              <p><strong className="text-white">Marketer:</strong> {data.marketerName}</p>
              <p><strong className="text-white">Country of Origin:</strong> {data.countryOfOrigin}</p>
              <p><strong className="text-white">Licence Type:</strong> {data.licenceType}</p>
            </div>
          </div>

          {/* Official Code 128 Barcode Verification Stamp */}
          <div className="mt-6 border border-slate-800 bg-[#0A0A0C] p-4 text-center">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Official Code 128 Product Barcode</p>
            <div className="mt-3 flex justify-center">
              <div
                className="inline-block rounded-lg bg-white p-3 shadow-md"
                dangerouslySetInnerHTML={{
                  __html: generateBarcodeSvg(data.authenticityCode || data.sku, {
                    width: 280,
                    height: 80,
                    fontSize: 11,
                  }),
                }}
              />
            </div>
            <p className="mt-2 text-[11px] font-mono text-slate-400">Scanner Code: <span className="font-bold text-white">{data.authenticityCode}</span></p>
          </div>

          {/* Direct CTA */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 sm:flex-row">
            <p className="text-xs text-slate-400">Legend Killer Verification Protocol v2.0 • Live Scan Stamp</p>
            <Link to={`/products/${data.slug}`} className="btn-primary inline-flex items-center gap-2">
              VIEW PRODUCT SPECS & BUY <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
