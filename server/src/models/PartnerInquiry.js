import mongoose from "mongoose";

const partnerInquirySchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 100 },
  lastName: { type: String, trim: true, maxlength: 100 },
  gstNumber: { type: String, trim: true, uppercase: true, maxlength: 15 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  contactNumber: { type: String, required: true, trim: true, maxlength: 20 },
  address: { type: String, required: true, trim: true, maxlength: 500 },
  state: { type: String, required: true, trim: true, maxlength: 100 },
  category: { type: String, required: true, trim: true, maxlength: 100 },
  expectedMonthlySales: { type: String, required: true, trim: true, maxlength: 100 },
  message: { type: String, trim: true, maxlength: 3000 },
  currentBusiness: { type: String, required: true, trim: true, maxlength: 500 },
  status: { type: String, enum: ["NEW", "READ", "RESOLVED"], default: "NEW" },
}, { timestamps: true });

export default mongoose.model("PartnerInquiry", partnerInquirySchema);
