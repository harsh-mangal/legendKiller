import ContactMessage from "../models/ContactMessage.js";
import { sendMail } from "../utils/mailer.js";
import { ApiError } from "../utils/apiError.js";
import { isEmail, normalizeEmail, normalizePhone } from "../utils/validation.js";

const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);

export const createContactMessage = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const phone = normalizePhone(req.body.phone);
    const subject = String(req.body.subject || "").trim();
    const message = String(req.body.message || "").trim();
    if (!name || !email || !message) throw new ApiError(400, "Name, email and message are required");
    if (!isEmail(email)) throw new ApiError(400, "A valid email is required");
    if (message.length < 10) throw new ApiError(400, "Please provide a little more detail in your message");
    if (phone && !/^[6-9][0-9]{9}$/.test(phone)) throw new ApiError(400, "Enter a valid 10-digit Indian mobile number");
    const contact = await ContactMessage.create({ name, email, phone, subject, message });
    const recipient = process.env.CONTACT_TO || process.env.MAIL_FROM || process.env.SMTP_USER;
    if (recipient) {
      sendMail({
        to: recipient,
        subject: `Website enquiry: ${contact.subject || "General enquiry"}`,
        text: `${contact.name} <${contact.email}>\n${contact.phone || ""}\n\n${contact.message}`,
        html: `<p><strong>${escapeHtml(contact.name)}</strong> &lt;${escapeHtml(contact.email)}&gt;</p><p>${escapeHtml(contact.phone)}</p><p>${escapeHtml(contact.message).replace(/\n/g, "<br>")}</p>`,
      }).catch((error) => console.error("Contact notification email failed:", error.message));
    }
    res.status(201).json({ success: true, message: "Your message has been received", data: { id: contact._id } });
  } catch (error) { next(error); }
};

export const listContactMessages = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 25)));
    const query = req.query.status ? { status: String(req.query.status).toUpperCase() } : {};
    const [messages, total] = await Promise.all([
      ContactMessage.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      ContactMessage.countDocuments(query),
    ]);
    res.json({ success: true, data: messages, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

export const updateContactStatus = async (req, res, next) => {
  try {
    const status = String(req.body.status || "").toUpperCase();
    if (!["NEW", "READ", "RESOLVED"].includes(status)) throw new ApiError(400, "Invalid contact status");
    const contact = await ContactMessage.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!contact) throw new ApiError(404, "Contact message not found");
    res.json({ success: true, message: "Contact status updated", data: contact });
  } catch (error) { next(error); }
};
