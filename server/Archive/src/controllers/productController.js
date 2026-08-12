import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { uploadMultipleImages } from "../utils/imageUpload.js";
import { saveReviewMediaFiles } from "../utils/mediaUpload.js";
import { reviewThanksTemplate, sendMail } from "../utils/mailer.js";

const makeSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const parseArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const recalculateProductRating = (product) => {
  const approvedReviews = product.reviews.filter((review) => review.isApproved);

  product.numReviews = approvedReviews.length;

  product.rating = Number(
    (
      approvedReviews.reduce(
        (sum, review) => sum + Number(review.rating || 0),
        0
      ) / Math.max(product.numReviews, 1)
    ).toFixed(1)
  );
};


export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      shortDescription,
      description,
      longDescription,
      benefits,
      ingredients,
      howToUse,
      suitableFor,
      price,
      mrp,
      stock,
      unit,
      weight,
      isFeatured,
      isBestSeller,
    } = req.body;

    const images = await uploadMultipleImages(req.files, "products");

    const product = await Product.create({
      name,
      slug: makeSlug(name),
      category,
      shortDescription,
      description,
      longDescription,
      benefits: parseArray(benefits),
      ingredients: parseArray(ingredients),
      suitableFor: parseArray(suitableFor),
      howToUse,
      images,
      price: Number(price),
      mrp: Number(mrp),
      stock: Number(stock || 0),
      unit,
      weight,
      isFeatured: isFeatured === "true" || isFeatured === true,
      isBestSeller: isBestSeller === "true" || isBestSeller === true,
    });

    res.status(201).json({ success: true, message: "Product created", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const fields = ["name", "category", "shortDescription", "description", "longDescription", "howToUse", "unit", "weight", "price", "mrp", "stock"];
    for (const field of fields) {
      if (req.body[field] !== undefined) product[field] = ["price", "mrp", "stock"].includes(field) ? Number(req.body[field]) : req.body[field];
    }
    if (req.body.name !== undefined) product.slug = makeSlug(req.body.name);
    for (const field of ["benefits", "ingredients", "suitableFor"]) if (req.body[field] !== undefined) product[field] = parseArray(req.body[field]);
    for (const field of ["isFeatured", "isBestSeller", "isActive"]) {
      if (req.body[field] !== undefined) product[field] = req.body[field] === true || req.body[field] === "true";
    }
    const images = await uploadMultipleImages(req.files, "products");
    if (images.length) product.images = images;
    await product.save();
    await product.populate("category", "name slug");
    res.json({ success: true, message: "Product updated", data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    product.isActive = false;
    await product.save();
    res.json({ success: true, message: "Product archived" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, featured, bestSeller, page = 1, limit = 12, includeInactive } = req.query;
    const query = includeInactive === "true" && req.user?.role === "ADMIN" ? {} : { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      // category can be an ObjectId from admin or a slug from the client. Slug filtering is applied after populate.
      if (/^[0-9a-fA-F]{24}$/.test(category)) query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (featured === "true") query.isFeatured = true;
    if (bestSeller === "true") query.isBestSeller = true;

    const skip = (Number(page) - 1) * Number(limit);
    let productsQuery = Product.find(query).populate("category", "name slug").sort({ createdAt: -1 });

    if (limit !== "all") productsQuery = productsQuery.skip(skip).limit(Number(limit));
    let products = await productsQuery;

    if (category && !/^[0-9a-fA-F]{24}$/.test(category)) {
      products = products.filter((product) => product.category?.slug === category);
    }

    const total = category && !/^[0-9a-fA-F]{24}$/.test(category) ? products.length : await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: { total, page: Number(page), pages: limit === "all" ? 1 : Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate("category", "name slug");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const related = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [{ category: product.category }, { isBestSeller: true }, { isFeatured: true }],
    })
      .populate("category", "name slug")
      .limit(6)
      .sort({ isBestSeller: -1, isFeatured: -1, createdAt: -1 });

    res.json({ success: true, data: related });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addProductReview = async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;
    if (!name || !email || !rating || !comment) {
      return res.status(400).json({ success: false, message: "Name, email, rating and review are required" });
    }

    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const order = await Order.findOne({
      $or: [{ "items.product": product._id }, { "items.comboProducts.product": product._id }],
      $and: [{ $or: [
        { "shippingAddress.email": String(email).toLowerCase().trim() },
        { "guestContact.email": String(email).toLowerCase().trim() },
      ]}],
      orderStatus: { $ne: "CANCELLED" },
    });

    if (!order) {
      return res.status(403).json({ success: false, message: "Only customers who purchased this product can submit a review. Please use the same email used at checkout." });
    }

    const alreadyReviewed = product.reviews.some((review) => String(review.email || "").toLowerCase() === String(email).toLowerCase().trim());
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: "You have already reviewed this product with this email." });
    }

    const media = await saveReviewMediaFiles(req.files || [], "reviews");
    product.reviews.push({ name, email, rating: Number(rating), comment, isApproved: true, isVerifiedPurchase: true, media });
    recalculateProductRating(product);

    await product.save();
    await product.populate("category", "name slug");

    await sendMail({
      to: email,
      subject: `Thank you for reviewing ${product.name}`,
      html: reviewThanksTemplate({ userName: name, productName: product.name }),
      text: `Thank you ${name} for reviewing ${product.name}. Your feedback helps other Amyeka Veda customers.`,
    });

    res.status(201).json({ success: true, message: "Review added", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProductReviewStatus = async (req, res) => {
  try {
    const { slug, reviewId } = req.params;
    const { isApproved } = req.body;
    const product = await Product.findOne({ slug });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    review.isApproved = isApproved === true || isApproved === "true";
    recalculateProductRating(product);
    await product.save();
    await product.populate("category", "name slug");
    res.json({ success: true, message: "Review status updated", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProductReview = async (req, res) => {
  try {
    const { slug, reviewId } = req.params;

    const product = await Product.findOne({ slug, isActive: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const reviewExists = product.reviews.id(reviewId);

    if (!reviewExists) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    product.reviews.pull(reviewId);

    recalculateProductRating(product);

    await product.save();
    await product.populate("category", "name slug");

    return res.json({
      success: true,
      message: "Review deleted successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
