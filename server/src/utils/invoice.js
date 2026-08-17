const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);

export const ensureInvoiceNumber = (order) => {
  if (!order.invoiceNumber) {
    const year = new Date(order.createdAt || Date.now()).getFullYear();
    order.invoiceNumber = `LK-${year}-${String(order._id).slice(-8).toUpperCase()}`;
  }
  return order.invoiceNumber;
};

export const buildInvoiceData = (order) => ({
  invoiceNumber: ensureInvoiceNumber(order),
  orderNumber: order.publicOrderNumber || String(order._id),
  invoiceDate: order.paidAt || order.createdAt,
  business: {
    name: process.env.BUSINESS_LEGAL_NAME || "LEGEND BORN NUTRITION PRIVATE LIMITED",
    address: process.env.BUSINESS_ADDRESS || "PROPERTY IDNO.SRS/B04/227, NEAR VIVEKANAND SCHOOL, Sirsa, Haryana, 125055, India",
    gstin: process.env.BUSINESS_GSTIN || "08AABCL1234F1Z5",
    email: process.env.BUSINESS_SUPPORT_EMAIL || process.env.MAIL_FROM || "support@legendbornnutrition.com",
    phone: process.env.BUSINESS_SUPPORT_PHONE || "+91 98822 92197",
  },
  customer: order.shippingAddress,
  items: (order.items || []).map((item) => ({
    name: item.name,
    sku: item.sku || "",
    hsnCode: item.hsnCode || "21069099",
    quantity: item.quantity,
    unitPrice: item.price,
    gstRate: item.gstRate || 18,
    total: item.totalPrice ?? Number(item.price || 0) * Number(item.quantity || 1),
  })),
  amounts: {
    itemsPrice: order.itemsPrice,
    shippingPrice: order.shippingPrice,
    couponDiscountAmount: order.couponDiscountAmount || 0,
    coinDiscountAmount: order.amyekaDiscountAmount || order.viperDiscountAmount || 0,
    taxPrice: order.taxPrice || 0,
    totalPrice: order.totalPrice,
  },
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
});

export const generateInvoiceHtml = async (order) => {
  const data = buildInvoiceData(order);
  const rows = data.items.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.hsnCode)}</td><td>${item.quantity}</td><td>₹${Number(item.unitPrice).toFixed(2)}</td><td>₹${Number(item.total).toFixed(2)}</td></tr>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${escapeHtml(data.invoiceNumber)}</title><style>body{font-family:Arial,sans-serif;color:#111;margin:40px}h1{color:#FF5500;text-transform:uppercase;letter-spacing:1px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:24px}table{width:100%;border-collapse:collapse;margin-top:28px}th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#111;color:#FFB800}.totals{margin-left:auto;width:340px;margin-top:24px}.row{display:flex;justify-content:space-between;padding:6px 0}.total{font-size:18px;font-weight:700;border-top:2px solid #FF5500;margin-top:8px;padding-top:12px;color:#FF5500}</style></head><body><h1>${escapeHtml(data.business.name)}</h1><h2>Tax Invoice - Legend Killer (The Viper Protocol)</h2><div class="meta"><div><p><strong>Invoice:</strong> ${escapeHtml(data.invoiceNumber)}</p><p><strong>Order:</strong> ${escapeHtml(data.orderNumber)}</p><p><strong>Date:</strong> ${new Date(data.invoiceDate).toLocaleDateString("en-IN")}</p><p><strong>GSTIN:</strong> ${escapeHtml(data.business.gstin || "Not provided")}</p></div><div><p><strong>Bill to:</strong><br>${escapeHtml(data.customer.fullName)}<br>${escapeHtml(data.customer.addressLine1)} ${escapeHtml(data.customer.addressLine2)}<br>${escapeHtml(data.customer.city)}, ${escapeHtml(data.customer.state)} ${escapeHtml(data.customer.pincode)}<br>${escapeHtml(data.customer.phone)}</p></div></div><table><thead><tr><th>Supplement</th><th>HSN</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div class="row"><span>Subtotal</span><span>₹${Number(data.amounts.itemsPrice).toFixed(2)}</span></div><div class="row"><span>Shipping</span><span>₹${Number(data.amounts.shippingPrice).toFixed(2)}</span></div><div class="row"><span>Discounts</span><span>-₹${Number(data.amounts.couponDiscountAmount + data.amounts.coinDiscountAmount).toFixed(2)}</span></div><div class="row total"><span>Total Payable</span><span>₹${Number(data.amounts.totalPrice).toFixed(2)}</span></div></div><p style="margin-top:50px;color:#666">Computer-generated tax invoice by Legend Killer.</p></body></html>`;
  return { ...data, html };
};
