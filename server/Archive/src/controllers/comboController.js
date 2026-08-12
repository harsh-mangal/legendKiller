import Combo from "../models/Combo.js";
import Product from "../models/Product.js";
import { uploadMultipleImages } from "../utils/imageUpload.js";

const makeSlug = (text) => String(text || "").toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
const parseProducts = (value) => {
  if (!value) return [];
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  return (Array.isArray(parsed) ? parsed : []).map((item) => ({ product: item.product || item.productId || item._id, quantity: Math.max(1, Number(item.quantity || 1)) }));
};

const populateCombo = (query) => query.populate("products.product", "name slug images price mrp stock weight unit");

export const getCombos = async (req, res) => {
  try {
    const query = req.query.admin === "true" ? {} : { isActive: true };
    const combos = await populateCombo(Combo.find(query).sort({ createdAt: -1 }));
    res.json({ success: true, data: combos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getComboBySlug = async (req, res) => {
  try {
    const combo = await populateCombo(Combo.findOne({ slug: req.params.slug, isActive: true }));
    if (!combo) return res.status(404).json({ success: false, message: "Combo not found" });
    res.json({ success: true, data: combo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const calculateMrp = async (items) => {
  let mrp = 0;
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error("Selected product not found");
    mrp += Number(product.price || 0) * Number(item.quantity || 1);
  }
  return mrp;
};

export const createCombo = async (req, res) => {
  try {
    const products = parseProducts(req.body.products);
    if (!products.length) return res.status(400).json({ success: false, message: "Select at least one product for combo" });
    const images = await uploadMultipleImages(req.files, "combos");
    const calculatedMrp = await calculateMrp(products);
    const combo = await Combo.create({
      name: req.body.name,
      slug: makeSlug(req.body.slug || req.body.name),
      shortDescription: req.body.shortDescription,
      description: req.body.description,
      images,
      products,
      mrp: Number(req.body.mrp || calculatedMrp),
      price: Number(req.body.price || calculatedMrp),
      isFeatured: req.body.isFeatured === "true" || req.body.isFeatured === true,
      isActive: req.body.isActive === "false" ? false : true,
    });
    await combo.populate("products.product", "name slug images price mrp stock weight unit");
    res.status(201).json({ success: true, message: "Combo created", data: combo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCombo = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.name && !update.slug) update.slug = makeSlug(update.name);
    if (update.products) update.products = parseProducts(update.products);
    if (update.price) update.price = Number(update.price);
    if (update.mrp) update.mrp = Number(update.mrp);
    if (update.isFeatured !== undefined) update.isFeatured = update.isFeatured === true || update.isFeatured === "true";
    if (update.isActive !== undefined) update.isActive = update.isActive === true || update.isActive === "true";
    const images = await uploadMultipleImages(req.files, "combos");
    if (images.length) update.images = images;
    const combo = await populateCombo(Combo.findByIdAndUpdate(req.params.id, update, { new: true }));
    if (!combo) return res.status(404).json({ success: false, message: "Combo not found" });
    res.json({ success: true, message: "Combo updated", data: combo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCombo = async (req, res) => {
  try {
    await Combo.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Combo deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
