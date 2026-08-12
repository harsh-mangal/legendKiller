import ContactMessage from "../models/ContactMessage.js";
import { sendMail } from "../utils/mailer.js";

export const createContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name?.trim() || !email?.trim() || !message?.trim()) return res.status(400).json({ success: false, message: "Name, email and message are required" });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, message: "A valid email is required" });
    const contact = await ContactMessage.create({ name, email, phone, subject, message });
    const recipient = process.env.CONTACT_TO || process.env.MAIL_FROM || process.env.SMTP_USER;
    await sendMail({ to: recipient, subject: `Contact enquiry: ${contact.subject || "Website message"}`, text: `${contact.name} <${contact.email}>\n${contact.phone || ""}\n\n${contact.message}`, html: `<p><strong>${contact.name}</strong> &lt;${contact.email}&gt;</p><p>${contact.phone || ""}</p><p>${String(contact.message).replace(/\n/g, "<br>")}</p>` });
    res.status(201).json({ success: true, message: "Your message has been received" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
