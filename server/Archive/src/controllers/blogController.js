import Blog from "../models/Blog.js";
import { saveReviewMediaFiles } from "../utils/mediaUpload.js";

const makeSlug = (text) => String(text || "").toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
const parseArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return String(value).split(",").map((i) => i.trim()).filter(Boolean); }
};

const dummyBlogs = [
  {
    _id: "dummy-blog-1",
    title: "Why Daily Ayurvedic Rituals Make Skin Feel Healthier",
    slug: "daily-ayurvedic-rituals-for-skin",
    excerpt: "Simple herbal skincare habits can help your skin feel clean, calm and naturally nourished.",
    content: "Ayurveda focuses on daily care, gentle cleansing and plant-based nourishment. Start with a simple routine: cleanse, hydrate and apply a suitable herbal formulation consistently.",
    author: "Amyeka Veda",
    tags: ["Ayurveda", "Skin Care"],
    isPublished: true,
    publishedAt: new Date(),
  },
  {
    _id: "dummy-blog-2",
    title: "How to Choose the Right Herbal Product for Your Routine",
    slug: "choose-right-herbal-product",
    excerpt: "Understand your skin type, ingredient comfort and routine timing before selecting a product.",
    content: "Choose products according to your skin type and lifestyle. Patch test first, read ingredients carefully and keep your routine simple for better consistency.",
    author: "Amyeka Veda",
    tags: ["Herbal", "Wellness"],
    isPublished: true,
    publishedAt: new Date(),
  },
];

export const getBlogs = async (req, res) => {
  try {
    const query = req.query.admin === "true" ? {} : { isPublished: true };
    const blogs = await Blog.find(query).sort({ publishedAt: -1, createdAt: -1 });
    res.json({ success: true, data: blogs.length ? blogs : dummyBlogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true });
    const fallback = dummyBlogs.find((item) => item.slug === req.params.slug);
    if (!blog && !fallback) return res.status(404).json({ success: false, message: "Blog not found" });
    res.json({ success: true, data: blog || fallback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBlog = async (req, res) => {
  try {
    const media = await saveReviewMediaFiles(req.files || [], "blogs");
    const slug = makeSlug(req.body.slug || req.body.title);
    const blog = await Blog.create({
      title: req.body.title,
      slug,
      excerpt: req.body.excerpt,
      content: req.body.content,
      coverImage: media[0]?.url || "",
      author: req.body.author || "Amyeka Veda",
      tags: parseArray(req.body.tags),
      isPublished: req.body.isPublished === "false" ? false : true,
      publishedAt: req.body.isPublished === "false" ? null : new Date(),
    });
    res.status(201).json({ success: true, message: "Blog created", data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.title && !update.slug) update.slug = makeSlug(update.title);
    if (update.tags) update.tags = parseArray(update.tags);
    if (update.isPublished !== undefined) {
      update.isPublished = update.isPublished === true || update.isPublished === "true";
      if (update.isPublished) update.publishedAt = new Date();
    }
    const media = await saveReviewMediaFiles(req.files || [], "blogs");
    if (media[0]?.url) update.coverImage = media[0].url;
    const blog = await Blog.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.json({ success: true, message: "Blog updated", data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Blog deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
