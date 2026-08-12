export const normalizePhone = (value) => String(value || "").replace(/\D/g, "").slice(-10);

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

export const isValidIndianPhone = (value) => /^[6-9]\d{9}$/.test(normalizePhone(value));

export const isValidIndianPincode = (value) => /^[1-9]\d{5}$/.test(String(value || "").trim());

export const getCheckoutValidationError = (form) => {
  if (!String(form.fullName || "").trim()) return "Full name is required.";
  if (!isValidEmail(form.email)) return "Please enter a valid email address.";
  if (!isValidIndianPhone(form.phone)) return "Please enter a valid 10-digit Indian mobile number.";
  if (!String(form.addressLine1 || "").trim()) return "Address line 1 is required.";
  if (!String(form.city || "").trim()) return "City is required.";
  if (!String(form.state || "").trim()) return "State is required.";
  if (!isValidIndianPincode(form.pincode)) return "Please enter a valid 6-digit Indian pincode.";
  return "";
};

export const getContactValidationError = (form) => {
  if (String(form.name || "").trim().length < 2) return "Please enter your full name.";
  if (!isValidEmail(form.email)) return "Please enter a valid email address.";
  if (!isValidIndianPhone(form.phone)) return "Please enter a valid 10-digit Indian mobile number.";
  if (String(form.subject || "").trim().length < 4) return "Please enter a clear subject.";
  const messageLength = String(form.message || "").trim().length;
  if (messageLength < 20) return "Please provide at least 20 characters so we can assist you properly.";
  if (messageLength > 2000) return "Please keep your message under 2,000 characters.";
  return "";
};
