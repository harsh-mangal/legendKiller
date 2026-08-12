
const statusClass = (value = "") => {
  const status = String(value).toLowerCase();
  if (["paid", "completed", "delivered", "confirmed", "success"].some((item) => status.includes(item))) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (["cancelled", "failed", "rejected", "refunded"].some((item) => status.includes(item))) {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (["pending", "processing", "shipped", "cooking"].some((item) => status.includes(item))) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  return "border-slate-200 bg-slate-50 text-slate-700";
};

export default function StatusBadge({ value }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClass(value)}`}>
      {value || "Not available"}
    </span>
  );
}
