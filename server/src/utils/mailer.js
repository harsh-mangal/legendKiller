import nodemailer from "nodemailer";

const hasMailConfig = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
let transporter;

const getTransporter = () => {
  if (!hasMailConfig()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      pool: true,
      maxConnections: 5,
    });
  }
  return transporter;
};

const brand = {
  name: process.env.MAIL_FROM_NAME || "Legend Killer",
  from: process.env.MAIL_FROM || process.env.SMTP_USER,
};

export const sendMail = async ({ to, subject, html, text }) => {
  if (!to) return { skipped: true, reason: "No recipient email" };
  const mailer = getTransporter();
  if (!mailer) {
    if (process.env.NODE_ENV !== "test") console.warn(`[MAIL SKIPPED] ${subject} -> ${to}. SMTP is not configured.`);
    return { skipped: true, reason: "SMTP not configured" };
  }
  return mailer.sendMail({ from: `"${brand.name}" <${brand.from}>`, to, subject, html, text });
};

const shell = (content) => `
<div style="font-family:Arial,sans-serif;background:#0A0A0C;padding:24px;color:#f1f5f9;">
  <div style="max-width:680px;margin:auto;background:#121216;border:1px solid #FF5500;overflow:hidden;border-radius:8px;">
    <div style="background:linear-gradient(90deg, #FFB800, #FF5500, #FF1F00);color:#000000;padding:22px 26px;">
      <strong style="font-size:22px;letter-spacing:1px;text-transform:uppercase;">Legend Killer - The Viper Protocol</strong>
    </div>
    <div style="padding:26px;color:#f1f5f9;">${content}</div>
  </div>
</div>`;

export const orderPlacedTemplate = ({ userName, order }) => {
  const rows = (order.items || []).map((item) => `
    <tr><td style="padding:10px;border-bottom:1px solid #2A2A35;color:#f1f5f9;">${item.name}</td><td style="padding:10px;border-bottom:1px solid #2A2A35;text-align:center;color:#f1f5f9;">${item.quantity}</td><td style="padding:10px;border-bottom:1px solid #2A2A35;text-align:right;color:#FFB800;">₹${Number(item.totalPrice ?? item.price * item.quantity).toLocaleString("en-IN")}</td></tr>`).join("");
  return shell(`
    <h1 style="margin:0;font-size:24px;color:#FFB800;">Order Received</h1>
    <p>Hello ${userName || "there"},</p>
    <p>We have received your Legend Killer order. Keep this order number for tracking: <strong style="color:#FF5500;">${order.publicOrderNumber || order._id}</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;"><thead><tr><th style="text-align:left;padding:10px;background:#1A1A22;color:#FFB800;">Supplement</th><th style="padding:10px;background:#1A1A22;color:#FFB800;">Qty</th><th style="text-align:right;padding:10px;background:#1A1A22;color:#FFB800;">Amount</th></tr></thead><tbody>${rows}</tbody></table>
    <p style="text-align:right;font-size:18px;color:#FFB800;"><strong>Total: ₹${Number(order.totalPrice || 0).toLocaleString("en-IN")}</strong></p>
    <p>Payment: ${order.paymentMethod} (${order.paymentStatus}). We will share live courier updates once dispatched.</p>`);
};

export const otpTemplate = ({ name, otp }) => shell(`
  <h1 style="margin:0 0 10px;font-size:24px;color:#FFB800;">Your Legend Killer Login OTP</h1><p>Hello ${name || "there"},</p><p>Use this OTP to sign in to your Legend Killer account. It expires in 10 minutes.</p>
  <div style="font-size:32px;font-weight:900;letter-spacing:8px;background:linear-gradient(90deg, #FFB800, #FF5500);color:#000;padding:16px;text-align:center;margin:22px 0;border-radius:4px;">${otp}</div><p>Do not share this OTP with anyone.</p>`);

export const welcomeTemplate = ({ name }) => shell(`
  <h1 style="margin:0 0 10px;font-size:24px;color:#FFB800;">Welcome to Legend Killer</h1><p>Hello ${name || "there"},</p><p>Your account is ready. You can now track orders, save shipping addresses, and earn Viper Coins on every order.</p>`);

export const passwordResetTemplate = ({ name, resetUrl }) => shell(`
  <h1 style="margin:0 0 10px;font-size:24px;color:#FFB800;">Reset Your Password</h1><p>Hello ${name || "there"},</p><p>Use the link below to choose a new password. The link expires in 30 minutes.</p>
  <p><a href="${resetUrl}" style="display:inline-block;background:#FF5500;color:#000;font-weight:bold;padding:12px 20px;text-decoration:none;border-radius:4px;">Reset Password</a></p><p>If you did not request this, you can safely ignore this email.</p>`);

export const orderStatusTemplate = ({ name, order, message }) => shell(`
  <h1 style="margin:0 0 10px;font-size:24px;color:#FFB800;">Order Update</h1><p>Hello ${name || "there"},</p><p>${message}</p><p><strong>Order:</strong> ${order.publicOrderNumber || order._id}</p><p><strong>Status:</strong> ${order.orderStatus}</p>`);

export const reviewThanksTemplate = ({ userName, productName }) => shell(`
  <h1 style="margin:0 0 10px;font-size:24px;color:#FFB800;">Review Received</h1><p>Hello ${userName || "there"},</p><p>Thank you for reviewing <strong>${productName}</strong>. Your review will appear after moderation.</p>`);
