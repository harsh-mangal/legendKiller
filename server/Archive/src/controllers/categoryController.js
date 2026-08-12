import fs from "fs";
import path from "path";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { convertToWebpUnder200KB } from "../utils/imageUpload.js";

const makeSlug = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const deleteUploadedFile = async (fileUrl) => {
  try {
    if (!fileUrl || fileUrl.startsWith("http")) return;

    const relativePath = fileUrl.replace(/^\/+/, "");
    const fullPath = path.join(process.cwd(), relativePath);

    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  } catch (error) {
    console.warn("Category image cleanup failed:", error.message);
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const slug = makeSlug(name);
    const exists = await Category.findOne({ slug });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    let image = "";

    if (req.file) {
      image = await convertToWebpUnder200KB(req.file, "categories");
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description,
      image,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Category created",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";

    const filter = includeInactive ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name?.trim()) {
      const slug = makeSlug(name);
      const duplicate = await Category.findOne({
        _id: { $ne: id },
        slug,
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
      }

      category.name = name.trim();
      category.slug = slug;
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (isActive !== undefined) {
      category.isActive = isActive === true || isActive === "true";
    }

    if (req.file) {
      const oldImage = category.image;
      category.image = await convertToWebpUnder200KB(req.file, "categories");
      await deleteUploadedFile(oldImage);
    }

    await category.save();

    res.json({
      success: true,
      message: "Category updated",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const hardDelete = req.query.hard === "true";

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (hardDelete) {
      const productCount = await Product.countDocuments({ category: id });
      if (productCount) return res.status(409).json({ success: false, message: "Cannot permanently delete a category that is still assigned to products" });
      await deleteUploadedFile(category.image);
      await Category.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: "Category deleted permanently",
      });
    }

    category.isActive = false;
    await category.save();

    res.json({
      success: true,
      message: "Category deleted",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
