import Blog from "../models/Blog.js";
import { saveReviewMediaFiles } from "../utils/mediaUpload.js";
import { ApiError } from "../utils/apiError.js";
import { makeSlug, parseArray, parseBoolean } from "../utils/validation.js";

export const getBlogs = async (req, res, next) => {
  try {
    const filter = req.adminView && req.user?.role === "ADMIN" ? {} : { isPublished: true };
    const blogs = await Blog.find(filter).sort({ publishedAt: -1, createdAt: -1 });
    res.json({ success: true, data: blogs });
  } catch (error) { next(error); }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true });
    if (!blog) throw new ApiError(404, "Blog not found");
    res.json({ success: true, data: blog });
  } catch (error) { next(error); }
};

export const createBlog = async (req, res, next) => {
  try {
    const title = String(req.body.title || "").trim();
    const content = String(req.body.content || "").trim();
    if (!title || !content) throw new ApiError(400, "Title and content are required");
    const media = await saveReviewMediaFiles(req.files || [], "blogs");
    const isPublished = req.body.isPublished === undefined ? true : parseBoolean(req.body.isPublished);
    const blog = await Blog.create({
      title,
      slug: makeSlug(req.body.slug || title),
      excerpt: String(req.body.excerpt || "").trim(),
      content,
      coverImage: media[0]?.url || "",
      author: String(req.body.author || "Ameyka Veda").trim(),
      tags: parseArray(req.body.tags),
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    });
    res.status(201).json({ success: true, message: "Blog created", data: blog });
  } catch (error) { next(error); }
};

export const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) throw new ApiError(404, "Blog not found");
    if (req.body.title !== undefined) { blog.title = String(req.body.title).trim(); blog.slug = makeSlug(req.body.slug || req.body.title); }
    else if (req.body.slug !== undefined) blog.slug = makeSlug(req.body.slug);
    ["excerpt", "content", "author"].forEach((field) => { if (req.body[field] !== undefined) blog[field] = String(req.body[field] || "").trim(); });
    if (req.body.tags !== undefined) blog.tags = parseArray(req.body.tags);
    if (req.body.isPublished !== undefined) {
      blog.isPublished = parseBoolean(req.body.isPublished);
      blog.publishedAt = blog.isPublished ? blog.publishedAt || new Date() : null;
    }
    const media = await saveReviewMediaFiles(req.files || [], "blogs");
    if (media[0]?.url) blog.coverImage = media[0].url;
    await blog.save();
    res.json({ success: true, message: "Blog updated", data: blog });
  } catch (error) { next(error); }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, { isPublished: false, publishedAt: null }, { new: true });
    if (!blog) throw new ApiError(404, "Blog not found");
    res.json({ success: true, message: "Blog unpublished" });
  } catch (error) { next(error); }
};
