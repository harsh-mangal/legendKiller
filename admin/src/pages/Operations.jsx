import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  RefreshCw,
  Server,
  ShieldCheck,
  Store,
  XCircle,
} from "lucide-react";
import API, { API_BASE_URL, BASE_URL, STOREFRONT_URL } from "../api/axios";
import { Badge, Button, Card, LoadingState, PageHeader } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/errors";

const featureContracts = [
  { label: "Catalogue", endpoint: "/products/admin/all?limit=1", detail: "Products and inventory" },
  { label: "Categories", endpoint: "/categories/admin/all", detail: "Storefront navigation" },
  { label: "Combos", endpoint: "/combos/admin/all", detail: "Product bundles" },
  { label: "Orders", endpoint: "/orders?limit=1", detail: "Payment and fulfilment" },
  { label: "Customers", endpoint: "/admin/users-wallet-cart", detail: "Accounts, value and carts" },
  { label: "Coupons", endpoint: "/promotions/admin", detail: "Checkout promotions" },
  { label: "Delivery", endpoint: "/delivery/admin/settings", detail: "Pincode and payment rules" },
  { label: "Enquiries", endpoint: "/contact/admin?limit=1", detail: "Lead and support inbox" },
  { label: "Banners", endpoint: "/banners/admin/all?page=home", detail: "Storefront campaigns" },
  { label: "Testimonials", endpoint: "/testimonials/admin/all", detail: "Approved social proof" },
  { label: "Articles", endpoint: "/blogs/admin/all", detail: "Optional content API" },
  { label: "Ameyka Coins", endpoint: "/amyeka-coins/setting", detail: "Loyalty configuration" },
];

export default function Operations() {
  const [status, setStatus] = useState({ loading: true, health: null, ready: null, admin: null, features: [] });
  const toast = useToast();

  const load = useCallback(async () => {
    setStatus((current) => ({ ...current, loading: true }));
    try {
      const [health, ready, admin, ...features] = await Promise.allSettled([
        API.get(`${BASE_URL}/health`, { baseURL: "" }),
        API.get(`${BASE_URL}/ready`, { baseURL: "" }),
        API.get("/admin/dashboard"),
        ...featureContracts.map((feature) => API.get(feature.endpoint)),
      ]);
      setStatus({
        loading: false,
        health: health.status === "fulfilled" ? health.value.data : null,
        ready: ready.status === "fulfilled" ? ready.value.data : null,
        admin: admin.status === "fulfilled" ? admin.value.data : null,
        features: featureContracts.map((feature, index) => ({
          ...feature,
          ok: features[index]?.status === "fulfilled" && features[index]?.value?.data?.success !== false,
          statusCode: features[index]?.status === "rejected" ? features[index]?.reason?.response?.status : 200,
        })),
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Operational status could not be checked."));
      setStatus((current) => ({ ...current, loading: false }));
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const checks = [
    { label: "API process", ok: status.health?.success, detail: status.health ? `Uptime ${Math.floor(Number(status.health.uptime || 0) / 60)} minutes` : "No response" },
    { label: "Database readiness", ok: status.ready?.success, detail: status.ready?.status || "No response" },
    { label: "Admin authorization", ok: status.admin?.success, detail: status.admin?.success ? "Protected admin endpoint available" : "Admin endpoint unavailable" },
  ];
  const compatibility = useMemo(() => ({
    available: status.features.filter((feature) => feature.ok).length,
    total: status.features.length,
  }), [status.features]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Environment and compatibility"
        title="Operations"
        description="Verify that the admin, storefront and every supported commerce module are connected to the intended backend before editing live data."
        actions={<Button variant="secondary" onClick={load}><RefreshCw size={17} className={status.loading ? "animate-spin" : ""} /> Run checks</Button>}
      />

      {status.loading ? <LoadingState label="Checking API, database and commerce contracts…" /> : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {checks.map((check) => (
              <Card key={check.label} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {check.ok ? <CheckCircle2 className="text-emerald-700" size={25} /> : <XCircle className="text-red-700" size={25} />}
                    <h2 className="mt-4 font-bold text-stone-950">{check.label}</h2>
                    <p className="mt-1 text-xs leading-5 text-stone-500">{check.detail}</p>
                  </div>
                  <Badge tone={check.ok ? "success" : "danger"}>{check.ok ? "Available" : "Issue"}</Badge>
                </div>
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden">
            <div className="flex flex-col gap-2 border-b border-stone-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="font-bold text-stone-950">Backend feature compatibility</h2><p className="mt-1 text-xs text-stone-500">Read-only requests against every module used by this admin.</p></div>
              <Badge tone={compatibility.available === compatibility.total ? "success" : "warning"}>{compatibility.available} / {compatibility.total} available</Badge>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3">
              {status.features.map((feature) => (
                <div key={feature.label} className="flex items-start gap-3 border-b border-stone-100 p-4 sm:border-r">
                  {feature.ok ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={19} /> : <XCircle className="mt-0.5 shrink-0 text-red-700" size={19} />}
                  <div className="min-w-0"><p className="text-sm font-bold text-stone-950">{feature.label}</p><p className="mt-0.5 text-xs text-stone-500">{feature.detail}</p>{!feature.ok && <p className="mt-1 text-[11px] font-semibold text-red-700">HTTP {feature.statusCode || "network error"}</p>}</div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-3"><Server className="text-brand-800" /><h2 className="font-bold text-stone-950">Connected environment</h2></div>
          <dl className="mt-5 space-y-4 text-sm">
            <div><dt className="text-xs font-bold uppercase tracking-wider text-stone-500">Admin API base</dt><dd className="mt-1 break-all rounded-xl bg-stone-100 p-3 font-mono text-xs text-stone-800">{API_BASE_URL}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wider text-stone-500">Asset/server base</dt><dd className="mt-1 break-all rounded-xl bg-stone-100 p-3 font-mono text-xs text-stone-800">{BASE_URL}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wider text-stone-500">Storefront</dt><dd className="mt-1 break-all rounded-xl bg-stone-100 p-3 font-mono text-xs text-stone-800">{STOREFRONT_URL}</dd></div>
          </dl>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3"><ShieldCheck className="text-copper-700" /><h2 className="font-bold text-stone-950">Launch safeguards</h2></div>
          <div className="mt-5 space-y-3 text-sm leading-6 text-stone-700">
            {[
              "Set VITE_API_BASE_URL explicitly in production; the admin build intentionally fails without it.",
              "Use the same backend environment for storefront and admin when validating inventory and orders.",
              "Keep the admin domain out of search engines and protect administrator credentials with unique passwords.",
              "Run backend migrations, health checks and staging payment tests before first production use.",
            ].map((text) => <div key={text} className="flex gap-3"><CircleAlert size={17} className="mt-1 shrink-0 text-gold-700" /><p>{text}</p></div>)}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <a className="btn btn-secondary btn-sm" href={STOREFRONT_URL} target="_blank" rel="noreferrer"><Store size={16} /> Open storefront <ExternalLink size={14} /></a>
            <a className="btn btn-secondary btn-sm" href={`${BASE_URL}/health`} target="_blank" rel="noreferrer"><Server size={16} /> API health <ExternalLink size={14} /></a>
          </div>
        </Card>
      </div>
    </div>
  );
}
