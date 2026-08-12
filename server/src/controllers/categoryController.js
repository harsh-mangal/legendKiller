import fs from "fs";
import path from "path";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { convertToWebpUnder200KB } from "../utils/imageUpload.js";
import { ApiError } from "../utils/apiError.js";
import { makeSlug, parseBoolean } from "../utils/validation.js";

const deleteUploadedFile = async (fileUrl) => {
  try {
    if (!fileUrl || /^https?:/i.test(fileUrl)) return;
    const fullPath = path.join(process.cwd(), fileUrl.replace(/^\/+/, ""));
    if (fs.existsSync(fullPath)) await fs.promises.unlink(fullPath);
  } catch (error) {
    console.warn("Category image cleanup failed:", error.message);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name) throw new ApiError(400, "Category name is required");
    const slug = makeSlug(req.body.slug || name);
    if (!slug) throw new ApiError(400, "Category slug is invalid");
    if (await Category.exists({ slug })) throw new ApiError(409, "A category with this name already exists");
    const image = req.file ? await convertToWebpUnder200KB(req.file, "categories") : "";
    const category = await Category.create({ name, slug, description: String(req.body.description || "").trim(), image, isActive: true });
    res.status(201).json({ success: true, message: "Category created", data: category });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const filter = req.adminView && req.user?.role === "ADMIN" ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) throw new ApiError(404, "Category not found");
    const oldImage = category.image;
    if (req.body.name !== undefined) {
      category.name = String(req.body.name).trim();
      category.slug = makeSlug(req.body.slug || req.body.name);
    } else if (req.body.slug !== undefined) category.slug = makeSlug(req.body.slug);
    if (req.body.description !== undefined) category.description = String(req.body.description || "").trim();
    if (req.body.isActive !== undefined) category.isActive = parseBoolean(req.body.isActive);
    if (req.file) category.image = await convertToWebpUnder200KB(req.file, "categories");
    await category.save();
    if (req.file && oldImage && oldImage !== category.image) await deleteUploadedFile(oldImage);
    res.json({ success: true, message: "Category updated", data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) throw new ApiError(404, "Category not found");
    if (await Product.exists({ category: category._id, isActive: true })) throw new ApiError(409, "Archive or move active products before disabling this category");
    category.isActive = false;
    await category.save();
    res.json({ success: true, message: "Category archived" });
  } catch (error) {
    next(error);
  }
};
