import Testimonial from "../models/Testimonial.js";
import { saveReviewMediaFiles } from "../utils/mediaUpload.js";

const dummyTestimonials = [
  { _id: "dummy-testimonial-1", name: "Neha Kapoor", location: "Jaipur", rating: 5, text: "Amyeka Veda products feel natural, elegant and trustworthy. The shopping experience was smooth.", isActive: true },
  { _id: "dummy-testimonial-2", name: "Karan Malhotra", location: "Delhi", rating: 5, text: "The product quality is impressive and the website experience feels premium.", isActive: true },
  { _id: "dummy-testimonial-3", name: "Simran Kaur", location: "Chandigarh", rating: 5, text: "Loved the ingredients and the clean packaging. Will definitely order again.", isActive: true },
];

export const getTestimonials = async (req, res) => {
  try {
    const query = req.query.admin === "true" ? {} : { isActive: true };
    const testimonials = await Testimonial.find(query).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, data: testimonials.length ? testimonials : dummyTestimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const media = await saveReviewMediaFiles(req.files || [], "testimonials");
    const testimonial = await Testimonial.create({
      name: req.body.name,
      location: req.body.location,
      rating: Number(req.body.rating || 5),
      text: req.body.text,
      image: media[0]?.url || "",
      isActive: req.body.isActive === "false" ? false : true,
      sortOrder: Number(req.body.sortOrder || 0),
    });
    res.status(201).json({ success: true, message: "Testimonial created", data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.rating) update.rating = Number(update.rating);
    if (update.sortOrder) update.sortOrder = Number(update.sortOrder);
    if (update.isActive !== undefined) update.isActive = update.isActive === true || update.isActive === "true";
    const media = await saveReviewMediaFiles(req.files || [], "testimonials");
    if (media[0]?.url) update.image = media[0].url;
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!testimonial) return res.status(404).json({ success: false, message: "Testimonial not found" });
    res.json({ success: true, message: "Testimonial updated", data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Testimonial deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
