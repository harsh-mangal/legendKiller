import nodemailer from "nodemailer";

const hasMailConfig = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const createTransporter = () => {
  if (!hasMailConfig()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const brand = {
  name: process.env.MAIL_FROM_NAME || "Amyeka Veda",
  from: process.env.MAIL_FROM || process.env.SMTP_USER,
};

export const sendMail = async ({ to, subject, html, text }) => {
  if (!to) return { skipped: true, reason: "No recipient email" };
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[MAIL SKIPPED] ${subject} -> ${to}. Configure SMTP_HOST, SMTP_USER and SMTP_PASS to enable Gmail/Nodemailer.`);
    return { skipped: true, reason: "SMTP not configured" };
  }

  return transporter.sendMail({
    from: `"${brand.name}" <${brand.from}>`,
    to,
    subject,
    html,
    text,
  });
};

export const orderPlacedTemplate = ({ userName, order }) => {
  const rows = (order.items || [])
    .map(
      (item) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">₹${Number(item.price || 0).toLocaleString("en-IN")}</td>
        </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,sans-serif;background:#f7f2e8;padding:24px;color:#243320;">
    <div style="max-width:680px;margin:auto;background:#fffdf8;border:1px solid #e6d6b8;border-radius:18px;overflow:hidden;">
      <div style="background:#243320;color:#f5efe2;padding:24px;">
        <h1 style="margin:0;font-size:24px;">Order received</h1>
        <p style="margin:8px 0 0;opacity:.85;">Thank you ${userName || "for shopping with us"}. We have received your Amyeka Veda order.</p>
      </div>
      <div style="padding:24px;">
        <p><strong>Order ID:</strong> #${String(order._id).slice(-8).toUpperCase()}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod} (${order.paymentStatus})</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <thead><tr><th style="text-align:left;padding:10px;background:#f5efe2;">Product</th><th style="padding:10px;background:#f5efe2;">Qty</th><th style="text-align:right;padding:10px;background:#f5efe2;">Price</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="text-align:right;margin-top:18px;font-size:18px;"><strong>Total: ₹${Number(order.totalPrice || 0).toLocaleString("en-IN")}</strong></div>
        <p style="margin-top:24px;line-height:1.6;color:#5f594d;">Our team will confirm and dispatch your order soon. For any help, reply to this email.</p>
      </div>
    </div>
  </div>`;
};

export const otpTemplate = ({ name, otp }) => `
  <div style="font-family:Arial,sans-serif;background:#f7f2e8;padding:24px;color:#243320;">
    <div style="max-width:520px;margin:auto;background:#fffdf8;border:1px solid #e6d6b8;border-radius:18px;padding:28px;">
      <h1 style="margin:0 0 10px;font-size:24px;">Your Amyeka Veda login OTP</h1>
      <p>Hello ${name || "there"},</p>
      <p>Use the OTP below to securely login to your account. It is valid for 10 minutes.</p>
      <div style="font-size:32px;font-weight:800;letter-spacing:8px;background:#243320;color:#f5efe2;padding:16px;text-align:center;border-radius:14px;margin:22px 0;">${otp}</div>
      <p style="color:#5f594d;">Please ignore this email if you did not request it.</p>
    </div>
  </div>`;

export const welcomeTemplate = ({ name }) => `
  <div style="font-family:Arial,sans-serif;background:#f7f2e8;padding:24px;color:#243320;">
    <div style="max-width:560px;margin:auto;background:#fffdf8;border:1px solid #e6d6b8;border-radius:18px;padding:28px;">
      <h1 style="margin:0 0 10px;font-size:24px;">Welcome to Amyeka Veda</h1>
      <p>Hello ${name || "there"},</p>
      <p>Your account is ready. You can now track orders, view your order history and use Amyeka Coins on future purchases.</p>
    </div>
  </div>`;

export const reviewThanksTemplate = ({ userName, productName }) => `
  <div style="font-family:Arial,sans-serif;background:#f7f2e8;padding:24px;color:#243320;">
    <div style="max-width:560px;margin:auto;background:#fffdf8;border:1px solid #e6d6b8;border-radius:18px;padding:28px;">
      <h1 style="margin:0 0 10px;font-size:24px;">Thank you for your review</h1>
      <p>Hello ${userName || "there"},</p>
      <p>Thank you for sharing your experience with <strong>${productName}</strong>. Your honest feedback helps other customers choose the right Amyeka Veda product.</p>
      <p style="color:#5f594d;">We are grateful to have you in the Amyeka Veda community.</p>
    </div>
  </div>`;
