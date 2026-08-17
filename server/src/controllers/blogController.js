import Blog from "../models/Blog.js";
import { saveReviewMediaFiles } from "../utils/mediaUpload.js";
import { ApiError } from "../utils/apiError.js";
import { makeSlug, parseArray, parseBoolean } from "../utils/validation.js";

const calculateReadTime = (content) => {
  const words = String(content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

export const getBlogs = async (req, res, next) => {
  try {
    const filter = req.adminView && req.user?.role === "ADMIN" ? {} : { isPublished: true };
    const blogs = await Blog.find(filter).sort({ isFeatured: -1, publishedAt: -1, createdAt: -1 });
    res.json({ success: true, data: blogs });
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true });
    if (!blog) throw new ApiError(404, "Article not found");
    res.json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const title = String(req.body.title || "").trim();
    const content = String(req.body.content || "").trim();
    if (!title || !content) throw new ApiError(400, "Article title and content are required");

    const media = await saveReviewMediaFiles(req.files || [], "blogs");
    const isPublished = req.body.isPublished === undefined ? true : parseBoolean(req.body.isPublished);
    const isFeatured = parseBoolean(req.body.isFeatured);
    const slug = makeSlug(req.body.slug || title);
    const excerpt = String(req.body.excerpt || content.slice(0, 160).replace(/\s+/g, " ")).trim();
    const readTimeMinutes = req.body.readTimeMinutes ? Number(req.body.readTimeMinutes) : calculateReadTime(content);

    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      coverImage: media[0]?.url || req.body.coverImage || "",
      imageAlt: String(req.body.imageAlt || title).trim(),
      author: String(req.body.author || "Legend Born Research Team").trim(),
      category: String(req.body.category || "Sports Nutrition").trim(),
      tags: parseArray(req.body.tags),
      focusKeyword: String(req.body.focusKeyword || "").trim(),
      secondaryKeywords: parseArray(req.body.secondaryKeywords),
      metaTitle: String(req.body.metaTitle || title).trim(),
      metaDescription: String(req.body.metaDescription || excerpt).trim(),
      canonicalUrl: String(req.body.canonicalUrl || `https://legendbornnutrition.com/articles/${slug}`).trim(),
      readTimeMinutes,
      isFeatured,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    });

    res.status(201).json({ success: true, message: "Article created successfully with SEO optimization", data: blog });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) throw new ApiError(404, "Article not found");

    if (req.body.title !== undefined) blog.title = String(req.body.title).trim();
    if (req.body.slug !== undefined) blog.slug = makeSlug(req.body.slug || blog.title);
    if (req.body.content !== undefined) {
      blog.content = String(req.body.content).trim();
      blog.readTimeMinutes = calculateReadTime(blog.content);
    }
    if (req.body.excerpt !== undefined) blog.excerpt = String(req.body.excerpt).trim();
    if (req.body.author !== undefined) blog.author = String(req.body.author).trim();
    if (req.body.category !== undefined) blog.category = String(req.body.category).trim();
    if (req.body.tags !== undefined) blog.tags = parseArray(req.body.tags);
    if (req.body.focusKeyword !== undefined) blog.focusKeyword = String(req.body.focusKeyword).trim();
    if (req.body.secondaryKeywords !== undefined) blog.secondaryKeywords = parseArray(req.body.secondaryKeywords);
    if (req.body.metaTitle !== undefined) blog.metaTitle = String(req.body.metaTitle).trim();
    if (req.body.metaDescription !== undefined) blog.metaDescription = String(req.body.metaDescription).trim();
    if (req.body.canonicalUrl !== undefined) blog.canonicalUrl = String(req.body.canonicalUrl).trim();
    if (req.body.imageAlt !== undefined) blog.imageAlt = String(req.body.imageAlt).trim();
    if (req.body.readTimeMinutes !== undefined && Number(req.body.readTimeMinutes) > 0) {
      blog.readTimeMinutes = Number(req.body.readTimeMinutes);
    }
    if (req.body.isFeatured !== undefined) blog.isFeatured = parseBoolean(req.body.isFeatured);
    if (req.body.isPublished !== undefined) {
      blog.isPublished = parseBoolean(req.body.isPublished);
      blog.publishedAt = blog.isPublished ? blog.publishedAt || new Date() : null;
    }

    const media = await saveReviewMediaFiles(req.files || [], "blogs");
    if (media[0]?.url) blog.coverImage = media[0].url;

    await blog.save();
    res.json({ success: true, message: "Article updated successfully", data: blog });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, { isPublished: false, publishedAt: null }, { new: true });
    if (!blog) throw new ApiError(404, "Article not found");
    res.json({ success: true, message: "Article unpublished" });
  } catch (error) {
    next(error);
  }
};
