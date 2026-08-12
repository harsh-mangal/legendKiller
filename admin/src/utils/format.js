export const currency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const number = (value = 0) =>
  new Intl.NumberFormat("en-IN").format(Number(value || 0));

export const dateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const dateOnly = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
};

export const compactId = (value = "") => String(value).slice(-8).toUpperCase();

export const toLines = (value) => {
  if (Array.isArray(value)) return value.join("\n");
  return value || "";
};

export const parseLines = (value) =>
  String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

export const percentageOff = (mrp, price) => {
  const original = Number(mrp || 0);
  const sale = Number(price || 0);
  if (!original || original <= sale) return 0;
  return Math.round(((original - sale) / original) * 100);
};

export const orderTone = (status) => ({
  PLACED: "info",
  CONFIRMED: "info",
  PACKED: "warning",
  SHIPPED: "warning",
  DELIVERED: "success",
  CANCELLED: "danger",
  RETURN_REQUESTED: "warning",
  RETURNED: "neutral",
}[status] || "neutral");

export const paymentTone = (status) => ({
  PAID: "success",
  PENDING: "warning",
  PROCESSING: "info",
  FAILED: "danger",
  CANCELLED: "neutral",
  REFUND_PENDING: "warning",
  REFUNDED: "neutral",
}[status] || "neutral");
