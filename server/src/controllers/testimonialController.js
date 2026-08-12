import Testimonial from "../models/Testimonial.js";
import { saveReviewMediaFiles } from "../utils/mediaUpload.js";
import { ApiError } from "../utils/apiError.js";
import { parseBoolean, parseNumber } from "../utils/validation.js";

export const getTestimonials = async (req, res, next) => {
  try {
    const filter = req.adminView && req.user?.role === "ADMIN" ? {} : { isActive: true };
    const testimonials = await Testimonial.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, data: testimonials });
  } catch (error) { next(error); }
};

export const createTestimonial = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const text = String(req.body.text || "").trim();
    if (!name || !text) throw new ApiError(400, "Name and testimonial text are required");
    const media = await saveReviewMediaFiles(req.files || [], "testimonials");
    const testimonial = await Testimonial.create({
      name,
      location: String(req.body.location || "").trim(),
      rating: parseNumber(req.body.rating ?? 5, { name: "Rating", min: 1, max: 5 }),
      text,
      image: media[0]?.url || "",
      isActive: req.body.isActive === undefined ? true : parseBoolean(req.body.isActive),
      sortOrder: parseNumber(req.body.sortOrder ?? 0, { name: "Sort order", integer: true }),
    });
    res.status(201).json({ success: true, message: "Testimonial created", data: testimonial });
  } catch (error) { next(error); }
};

export const updateTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) throw new ApiError(404, "Testimonial not found");
    ["name", "location", "text"].forEach((field) => { if (req.body[field] !== undefined) testimonial[field] = String(req.body[field] || "").trim(); });
    if (req.body.rating !== undefined) testimonial.rating = parseNumber(req.body.rating, { name: "Rating", min: 1, max: 5 });
    if (req.body.sortOrder !== undefined) testimonial.sortOrder = parseNumber(req.body.sortOrder, { name: "Sort order", integer: true });
    if (req.body.isActive !== undefined) testimonial.isActive = parseBoolean(req.body.isActive);
    const media = await saveReviewMediaFiles(req.files || [], "testimonials");
    if (media[0]?.url) testimonial.image = media[0].url;
    await testimonial.save();
    res.json({ success: true, message: "Testimonial updated", data: testimonial });
  } catch (error) { next(error); }
};

export const deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!testimonial) throw new ApiError(404, "Testimonial not found");
    res.json({ success: true, message: "Testimonial archived" });
  } catch (error) { next(error); }
};
