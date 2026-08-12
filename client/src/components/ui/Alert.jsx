import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const variants = {
  error: { Icon: AlertCircle, className: "border-red-800 bg-red-950/80 text-red-300" },
  success: { Icon: CheckCircle2, className: "border-emerald-800 bg-emerald-950/80 text-emerald-300" },
  info: { Icon: Info, className: "border-slate-800 bg-[#1A1A22] text-slate-200" },
};

export default function Alert({ type = "info", children, className = "" }) {
  const { Icon, className: variantClass } = variants[type] || variants.info;
  return (
    <div role={type === "error" ? "alert" : "status"} className={`flex gap-3 rounded-none border p-4 text-sm leading-6 ${variantClass} ${className}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="font-semibold">{children}</div>
    </div>
  );
}
