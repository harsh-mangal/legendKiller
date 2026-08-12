import Category from "../models/Category.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { uploadMultipleImages } from "../utils/imageUpload.js";
import { saveReviewMediaFiles, saveVideoFiles } from "../utils/mediaUpload.js";
import { reviewThanksTemplate, sendMail } from "../utils/mailer.js";
import { ApiError } from "../utils/apiError.js";
import { escapeRegex, makeSlug, normalizeEmail, parseArray, parseBoolean, parseNumber } from "../utils/validation.js";

const legalFields = [
  "sku", "warnings", "storageInstructions", "legalDisclaimer", "manufacturerName", "marketerName", "countryOfOrigin",
  "licenceType", "licenceNumber", "hsnCode", "gstRate", "vegetarian", "batchTrackingEnabled", "expiryTrackingEnabled",
  "seoTitle", "seoDescription", "lowStockThreshold",
];

const recalculateProductRating = (product) => {
  const approved = product.reviews.filter((review) => review.isApproved);
  product.numReviews = approved.length;
  product.rating = approved.length ? Number((approved.reduce((sum, review) => sum + Number(review.rating || 0), 0) / approved.length).toFixed(1)) : 0;
};

const publicProduct = (product) => {
  const value = product.toObject ? product.toObject() : { ...product };
  value.reviews = (value.reviews || []).filter((review) => review.isApproved);
  value.numReviews = value.reviews.length;
  value.rating = value.reviews.length ? Number((value.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / value.reviews.length).toFixed(1)) : 0;
  return value;
};

const validateCommercialFields = ({ price, mrp, stock }) => {
  const parsedPrice = parseNumber(price, { name: "Price", min: 0 });
  const parsedMrp = parseNumber(mrp, { name: "MRP", min: 0 });
  const parsedStock = parseNumber(stock ?? 0, { name: "Stock", min: 0, integer: true });
  if (parsedMrp < parsedPrice) throw new ApiError(400, "MRP cannot be lower than the selling price");
  return { price: parsedPrice, mrp: parsedMrp, stock: parsedStock };
};

const uploadedFiles = (req, field) =>
  Array.isArray(req.files) ? (field === "images" ? req.files : []) : req.files?.[field] || [];

const infographicRecords = (urls, productName) =>
  urls.map((url, index) => ({
    url,
    altText: `${productName} infographic ${index + 1}`,
    caption: "",
  }));

const videoRecords = (urls, productName) =>
  urls.map((url, index) => ({
    url,
    title: `${productName} product video ${index + 1}`,
    caption: "",
  }));

const assignExtraFields = (target, body) => {
  for (const field of legalFields) {
    if (body[field] === undefined) continue;
    if (["warnings"].includes(field)) target[field] = parseArray(body[field]);
    else if (["gstRate", "lowStockThreshold"].includes(field)) target[field] = parseNumber(body[field], { name: field, min: 0, max: field === "gstRate" ? 100 : Infinity });
    else if (["vegetarian", "batchTrackingEnabled", "expiryTrackingEnabled"].includes(field)) target[field] = body[field] === "" || body[field] === null ? null : parseBoolean(body[field]);
    else if (field === "sku") target[field] = String(body[field] || "").trim().toUpperCase() || undefined;
    else target[field] = String(body[field] || "").trim();
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim();
    if (!name || !description || !req.body.category) throw new ApiError(400, "Name, category and description are required");
    const category = await Category.findById(req.body.category);
    if (!category) throw new ApiError(400, "Selected category does not exist");
    const commercial = validateCommercialFields(req.body);
    const images = await uploadMultipleImages(uploadedFiles(req, "images"), "products");
    const infographicUrls = await uploadMultipleImages(uploadedFiles(req, "infographics"), "product-infographics");
    const videoUrls = await saveVideoFiles(uploadedFiles(req, "videos"));
    const product = new Product({
      name,
      slug: makeSlug(req.body.slug || name),
      category: category._id,
      shortDescription: String(req.body.shortDescription || "").trim(),
      description,
      longDescription: String(req.body.longDescription || "").trim(),
      benefits: parseArray(req.body.benefits),
      ingredients: parseArray(req.body.ingredients),
      suitableFor: parseArray(req.body.suitableFor),
      howToUse: String(req.body.howToUse || "").trim(),
      images,
      infographics: infographicRecords(infographicUrls, name),
      videos: videoRecords(videoUrls, name),
      ...commercial,
      unit: String(req.body.unit || "Pack").trim(),
      weight: String(req.body.weight || "").trim(),
      isFeatured: parseBoolean(req.body.isFeatured),
      isBestSeller: parseBoolean(req.body.isBestSeller),
      isActive: req.body.isActive === undefined ? true : parseBoolean(req.body.isActive),
    });
    assignExtraFields(product, req.body);
    await product.save();
    await product.populate("category", "name slug");
    res.status(201).json({ success: true, message: "Product created", data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, "Product not found");
    if (req.body.name !== undefined) {
      product.name = String(req.body.name).trim();
      product.slug = makeSlug(req.body.slug || req.body.name);
    } else if (req.body.slug !== undefined) product.slug = makeSlug(req.body.slug);
    if (req.body.category !== undefined) {
      const category = await Category.findById(req.body.category);
      if (!category) throw new ApiError(400, "Selected category does not exist");
      product.category = category._id;
    }
    const stringFields = ["shortDescription", "description", "longDescription", "howToUse", "unit", "weight"];
    stringFields.forEach((field) => { if (req.body[field] !== undefined) product[field] = String(req.body[field] || "").trim(); });
    ["benefits", "ingredients", "suitableFor"].forEach((field) => { if (req.body[field] !== undefined) product[field] = parseArray(req.body[field]); });
    if (["price", "mrp", "stock"].some((field) => req.body[field] !== undefined)) {
      const commercial = validateCommercialFields({ price: req.body.price ?? product.price, mrp: req.body.mrp ?? product.mrp, stock: req.body.stock ?? product.stock });
      Object.assign(product, commercial);
    }
    ["isFeatured", "isBestSeller", "isActive"].forEach((field) => { if (req.body[field] !== undefined) product[field] = parseBoolean(req.body[field]); });
    assignExtraFields(product, req.body);
    const images = await uploadMultipleImages(uploadedFiles(req, "images"), "products");
    if (images.length) product.images = images;
    const infographicUrls = await uploadMultipleImages(uploadedFiles(req, "infographics"), "product-infographics");
    if (infographicUrls.length) product.infographics = infographicRecords(infographicUrls, product.name);
    else if (req.body.clearInfographics !== undefined && parseBoolean(req.body.clearInfographics)) product.infographics = [];
    const videoUrls = await saveVideoFiles(uploadedFiles(req, "videos"));
    if (videoUrls.length) product.videos = videoRecords(videoUrls, product.name);
    else if (req.body.clearVideos !== undefined && parseBoolean(req.body.clearVideos)) product.videos = [];
    await product.save();
    await product.populate("category", "name slug");
    res.json({ success: true, message: "Product updated", data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, "Product not found");
    product.isActive = false;
    await product.save();
    res.json({ success: true, message: "Product archived" });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const adminView = Boolean(req.adminView && req.user?.role === "ADMIN");
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = req.query.limit === "all" ? 0 : Math.min(100, Math.max(1, Number(req.query.limit || 12)));
    const query = adminView ? {} : { isActive: true };
    const search = String(req.query.search || "").trim();
    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      query.$or = [{ name: pattern }, { shortDescription: pattern }, { description: pattern }, { ingredients: pattern }];
    }
    if (req.query.category) {
      if (/^[0-9a-fA-F]{24}$/.test(req.query.category)) query.category = req.query.category;
      else {
        const category = await Category.findOne({ slug: String(req.query.category).toLowerCase(), ...(adminView ? {} : { isActive: true }) });
        if (!category) return res.json({ success: true, data: [], pagination: { total: 0, page, pages: 0 } });
        query.category = category._id;
      }
    }
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Math.max(0, Number(req.query.minPrice));
      if (req.query.maxPrice) query.price.$lte = Math.max(0, Number(req.query.maxPrice));
    }
    if (req.query.featured === "true") query.isFeatured = true;
    if (req.query.bestSeller === "true") query.isBestSeller = true;
    const sortMap = {
      "price-low": { price: 1, createdAt: -1 },
      "price-high": { price: -1, createdAt: -1 },
      rating: { rating: -1, numReviews: -1, createdAt: -1 },
      newest: { createdAt: -1 },
      featured: { isFeatured: -1, isBestSeller: -1, createdAt: -1 },
    };
    const sort = sortMap[req.query.sort] || sortMap.featured;
    let find = Product.find(query).populate("category", "name slug").sort(sort);
    if (limit) find = find.skip((page - 1) * limit).limit(limit);
    const [products, total] = await Promise.all([find, Product.countDocuments(query)]);
    res.json({
      success: true,
      data: adminView ? products : products.map(publicProduct),
      pagination: { total, page, pages: limit ? Math.ceil(total / limit) : 1 },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate("category", "name slug");
    if (!product) throw new ApiError(404, "Product not found");
    res.json({ success: true, data: publicProduct(product) });
  } catch (error) {
    next(error);
  }
};

export const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) throw new ApiError(404, "Product not found");
    const related = await Product.find({
      _id: { $ne: product._id }, isActive: true,
      $or: [{ category: product.category }, { isBestSeller: true }, { isFeatured: true }],
    }).populate("category", "name slug").limit(6).sort({ isBestSeller: -1, isFeatured: -1, createdAt: -1 });
    res.json({ success: true, data: related.map(publicProduct) });
  } catch (error) {
    next(error);
  }
};

export const addProductReview = async (req, res, next) => {
  try {
    const name = String(req.body.name || req.user?.name || "").trim();
    const email = normalizeEmail(req.user?.email);
    const rating = parseNumber(req.body.rating, { name: "Rating", min: 1, max: 5 });
    const comment = String(req.body.comment || "").trim();
    if (!name || !email || comment.length < 5) throw new ApiError(400, "Name, email, rating and a meaningful review are required");
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) throw new ApiError(404, "Product not found");
    // Avoid duplicate $or keys by using $and groups.
    const purchase = await Order.findOne({
      $and: [
        { $or: [{ "items.product": product._id }, { "items.comboProducts.product": product._id }] },
        { $or: [
          ...(req.user ? [{ user: req.user._id }] : []),
          { "shippingAddress.email": email },
          { "guestContact.email": email },
        ] },
        { $or: [{ paymentStatus: "PAID" }, { paymentMethod: "COD", orderStatus: "DELIVERED" }] },
        { orderStatus: { $ne: "CANCELLED" } },
      ],
    });
    if (!purchase) throw new ApiError(403, "Only verified purchasers can submit a review");
    const duplicate = product.reviews.some((review) => (req.user && String(review.user || "") === String(req.user._id)) || normalizeEmail(review.email) === email);
    if (duplicate) throw new ApiError(409, "You have already reviewed this product");
    const media = await saveReviewMediaFiles(req.files || [], "reviews");
    product.reviews.push({ user: req.user?._id || null, name, email, rating, comment, isApproved: false, isVerifiedPurchase: true, media });
    recalculateProductRating(product);
    await product.save();
    sendMail({
      to: email,
      subject: `We received your review for ${product.name}`,
      html: reviewThanksTemplate({ userName: name, productName: product.name }),
      text: `Thank you ${name}. Your review for ${product.name} is pending moderation.`,
    }).catch(() => {});
    res.status(201).json({ success: true, message: "Review submitted for moderation" });
  } catch (error) {
    next(error);
  }
};

export const updateProductReviewStatus = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) throw new ApiError(404, "Product not found");
    const review = product.reviews.id(req.params.reviewId);
    if (!review) throw new ApiError(404, "Review not found");
    review.isApproved = parseBoolean(req.body.isApproved);
    recalculateProductRating(product);
    await product.save();
    res.json({ success: true, message: "Review status updated", data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProductReview = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) throw new ApiError(404, "Product not found");
    const review = product.reviews.id(req.params.reviewId);
    if (!review) throw new ApiError(404, "Review not found");
    review.deleteOne();
    recalculateProductRating(product);
    await product.save();
    res.json({ success: true, message: "Review deleted", data: product });
  } catch (error) {
    next(error);
  }
};
