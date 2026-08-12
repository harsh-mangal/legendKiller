export const money = (value, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const discountPercent = (mrp, price) => {
  const original = Number(mrp || 0);
  const current = Number(price || 0);
  if (original <= 0 || current >= original) return 0;
  return Math.round(((original - current) / original) * 100);
};

export const shortOrderId = (value) => {
  const id = String(value || "");
  return id ? id.slice(-8).toUpperCase() : "—";
};

export const formatDate = (value, options = {}) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date);
};
