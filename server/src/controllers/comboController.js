import Combo from "../models/Combo.js";
import Product from "../models/Product.js";
import { uploadMultipleImages } from "../utils/imageUpload.js";
import { ApiError } from "../utils/apiError.js";
import { makeSlug, parseBoolean, parseNumber } from "../utils/validation.js";

const parseProducts = (value) => {
  if (!value) return [];
  let parsed = value;
  if (typeof value === "string") {
    try { parsed = JSON.parse(value); } catch { throw new ApiError(400, "Combo products must be valid JSON"); }
  }
  if (!Array.isArray(parsed)) throw new ApiError(400, "Combo products must be a list");
  return parsed.map((item) => ({ product: item.product || item.productId || item._id, quantity: parseNumber(item.quantity || 1, { name: "Combo quantity", min: 1, integer: true }) }));
};

const populateCombo = (query) => query.populate("products.product", "name slug images price mrp stock weight unit isActive");

const validateComboProducts = async (products) => {
  if (!products.length) throw new ApiError(400, "Select at least one product for the combo");
  const unique = new Set(products.map((item) => String(item.product)));
  if (unique.size !== products.length) throw new ApiError(400, "A product cannot be added to the same combo more than once");
  const found = await Product.find({ _id: { $in: [...unique] }, isActive: true });
  if (found.length !== unique.size) throw new ApiError(400, "One or more combo products are unavailable");
  return found;
};

const calculateMrp = (products, found) => {
  const map = new Map(found.map((product) => [String(product._id), product]));
  return products.reduce((sum, item) => sum + Number(map.get(String(item.product))?.price || 0) * item.quantity, 0);
};

export const getCombos = async (req, res, next) => {
  try {
    const filter = req.adminView && req.user?.role === "ADMIN" ? {} : { isActive: true };
    const combos = await populateCombo(Combo.find(filter).sort({ isFeatured: -1, createdAt: -1 }));
    res.json({ success: true, data: combos });
  } catch (error) { next(error); }
};

export const getComboBySlug = async (req, res, next) => {
  try {
    const combo = await populateCombo(Combo.findOne({ slug: req.params.slug, isActive: true }));
    if (!combo) throw new ApiError(404, "Combo not found");
    res.json({ success: true, data: combo });
  } catch (error) { next(error); }
};

export const createCombo = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name) throw new ApiError(400, "Combo name is required");
    const products = parseProducts(req.body.products);
    const found = await validateComboProducts(products);
    const calculatedMrp = calculateMrp(products, found);
    const price = parseNumber(req.body.price ?? calculatedMrp, { name: "Combo price", min: 0 });
    const mrp = parseNumber(req.body.mrp ?? calculatedMrp, { name: "Combo MRP", min: price });
    const images = await uploadMultipleImages(req.files, "combos");
    const combo = await Combo.create({
      name,
      slug: makeSlug(req.body.slug || name),
      shortDescription: String(req.body.shortDescription || "").trim(),
      description: String(req.body.description || "").trim(),
      images,
      products,
      mrp,
      price,
      isFeatured: parseBoolean(req.body.isFeatured),
      isActive: req.body.isActive === undefined ? true : parseBoolean(req.body.isActive),
    });
    await combo.populate("products.product", "name slug images price mrp stock weight unit isActive");
    res.status(201).json({ success: true, message: "Combo created", data: combo });
  } catch (error) { next(error); }
};

export const updateCombo = async (req, res, next) => {
  try {
    const combo = await Combo.findById(req.params.id);
    if (!combo) throw new ApiError(404, "Combo not found");
    if (req.body.name !== undefined) { combo.name = String(req.body.name).trim(); combo.slug = makeSlug(req.body.slug || req.body.name); }
    else if (req.body.slug !== undefined) combo.slug = makeSlug(req.body.slug);
    if (req.body.products !== undefined) {
      const products = parseProducts(req.body.products);
      await validateComboProducts(products);
      combo.products = products;
    }
    ["shortDescription", "description"].forEach((field) => { if (req.body[field] !== undefined) combo[field] = String(req.body[field] || "").trim(); });
    if (req.body.price !== undefined) combo.price = parseNumber(req.body.price, { name: "Combo price", min: 0 });
    if (req.body.mrp !== undefined) combo.mrp = parseNumber(req.body.mrp, { name: "Combo MRP", min: combo.price });
    if (Number(combo.mrp) < Number(combo.price)) throw new ApiError(400, "Combo MRP cannot be lower than the price");
    if (req.body.isFeatured !== undefined) combo.isFeatured = parseBoolean(req.body.isFeatured);
    if (req.body.isActive !== undefined) combo.isActive = parseBoolean(req.body.isActive);
    const images = await uploadMultipleImages(req.files, "combos");
    if (images.length) combo.images = images;
    await combo.save();
    await combo.populate("products.product", "name slug images price mrp stock weight unit isActive");
    res.json({ success: true, message: "Combo updated", data: combo });
  } catch (error) { next(error); }
};

export const deleteCombo = async (req, res, next) => {
  try {
    const combo = await Combo.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!combo) throw new ApiError(404, "Combo not found");
    res.json({ success: true, message: "Combo archived" });
  } catch (error) { next(error); }
};
