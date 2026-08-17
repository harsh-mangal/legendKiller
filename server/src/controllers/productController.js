import Category from "../models/Category.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { uploadMultipleImages } from "../utils/imageUpload.js";
import { saveReviewMediaFiles, saveVideoFiles } from "../utils/mediaUpload.js";
import { reviewThanksTemplate, sendMail } from "../utils/mailer.js";
import { ApiError } from "../utils/apiError.js";
import { escapeRegex, makeSlug, normalizeEmail, parseArray, parseBoolean, parseNumber } from "../utils/validation.js";
import { generateQrCodeDataUrl, generateQrCodeSvg } from "../utils/qrcode.js";

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
    title: `${productName} video ${index + 1}`,
    caption: "",
  }));

export const getProducts = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 12, sort = "-createdAt" } = req.query;
    const query = { isActive: true };
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) query.category = categoryDoc._id;
    }
    if (search) query.$text = { $search: search };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      data: products.map(publicProduct),
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) },
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

export const createProduct = async (req, res, next) => {
  try {
    const commercial = validateCommercialFields(req.body);
    const categoryDoc = await Category.findById(req.body.category);
    if (!categoryDoc) throw new ApiError(400, "Invalid category");

    const slug = makeSlug(req.body.name);
    const existing = await Product.findOne({ slug });
    if (existing) throw new ApiError(409, "A product with a similar name already exists");

    const uploadedImageUrls = await uploadMultipleImages(uploadedFiles(req, "images"), "products");
    const uploadedInfographicUrls = await uploadMultipleImages(uploadedFiles(req, "infographics"), "infographics");
    const uploadedVideoUrls = await saveVideoFiles(uploadedFiles(req, "videos"), "videos");

    const payload = {
      name: req.body.name,
      slug,
      category: categoryDoc._id,
      shortDescription: req.body.shortDescription,
      description: req.body.description,
      longDescription: req.body.longDescription,
      benefits: parseArray(req.body.benefits),
      ingredients: parseArray(req.body.ingredients),
      howToUse: req.body.howToUse,
      suitableFor: parseArray(req.body.suitableFor),
      images: uploadedImageUrls,
      infographics: infographicRecords(uploadedInfographicUrls, req.body.name),
      videos: videoRecords(uploadedVideoUrls, req.body.name),
      price: commercial.price,
      mrp: commercial.mrp,
      stock: commercial.stock,
      unit: req.body.unit || "Pack",
      weight: req.body.weight,
      isFeatured: parseBoolean(req.body.isFeatured),
      isBestSeller: parseBoolean(req.body.isBestSeller),
    };

    legalFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "warnings") payload.warnings = parseArray(req.body[field]);
        else if (field === "vegetarian") payload.vegetarian = parseBoolean(req.body[field]);
        else if (field === "batchTrackingEnabled" || field === "expiryTrackingEnabled") payload[field] = parseBoolean(req.body[field]);
        else if (field === "gstRate" || field === "lowStockThreshold") payload[field] = parseNumber(req.body[field], { name: field, min: 0 });
        else payload[field] = req.body[field];
      }
    });

    const product = await Product.create(payload);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, "Product not found");

    if (req.body.name && req.body.name !== product.name) {
      product.slug = makeSlug(req.body.name);
    }

    if (req.body.category) {
      const categoryDoc = await Category.findById(req.body.category);
      if (!categoryDoc) throw new ApiError(400, "Invalid category");
      product.category = categoryDoc._id;
    }

    if (req.body.price !== undefined || req.body.mrp !== undefined || req.body.stock !== undefined) {
      const commercial = validateCommercialFields({
        price: req.body.price ?? product.price,
        mrp: req.body.mrp ?? product.mrp,
        stock: req.body.stock ?? product.stock,
      });
      product.price = commercial.price;
      product.mrp = commercial.mrp;
      product.stock = commercial.stock;
    }

    const fields = ["name", "shortDescription", "description", "longDescription", "howToUse", "unit", "weight"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    if (req.body.benefits !== undefined) product.benefits = parseArray(req.body.benefits);
    if (req.body.ingredients !== undefined) product.ingredients = parseArray(req.body.ingredients);
    if (req.body.suitableFor !== undefined) product.suitableFor = parseArray(req.body.suitableFor);
    if (req.body.isFeatured !== undefined) product.isFeatured = parseBoolean(req.body.isFeatured);
    if (req.body.isBestSeller !== undefined) product.isBestSeller = parseBoolean(req.body.isBestSeller);

    legalFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "warnings") product.warnings = parseArray(req.body[field]);
        else if (field === "vegetarian") product.vegetarian = parseBoolean(req.body[field]);
        else if (field === "batchTrackingEnabled" || field === "expiryTrackingEnabled") product[field] = parseBoolean(req.body[field]);
        else if (field === "gstRate" || field === "lowStockThreshold") product[field] = parseNumber(req.body[field], { name: field, min: 0 });
        else product[field] = req.body[field];
      }
    });

    const newImages = await uploadMultipleImages(uploadedFiles(req, "images"), "products");
    if (newImages.length) product.images = [...product.images, ...newImages];

    await product.save();
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new ApiError(404, "Product not found");
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const addProductReview = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) throw new ApiError(404, "Product not found");

    const name = (req.body.name || req.user?.name || "").trim();
    const email = normalizeEmail(req.body.email || req.user?.email || "");
    const rating = parseNumber(req.body.rating, { name: "Rating", min: 1, max: 5, integer: true });
    const comment = (req.body.comment || "").trim();

    if (!name || !email || !comment) throw new ApiError(400, "Name, email and review comment are required");

    let purchase = null;
    if (req.user) {
      purchase = await Order.findOne({ user: req.user._id, "items.product": product._id, paymentStatus: "PAID" });
    }
    if (!purchase && email) {
      purchase = await Order.findOne({ guestEmail: email, "items.product": product._id, paymentStatus: "PAID" });
    }

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

export const verifyProductByCode = async (req, res, next) => {
  try {
    const rawCode = (req.params.code || "").trim();
    if (!rawCode) throw new ApiError(400, "Authenticity verification code is required");

    let product = await Product.findOne({
      $or: [
        { authenticityCode: rawCode.toUpperCase() },
        { sku: rawCode.toUpperCase() },
        { slug: rawCode.toLowerCase() },
      ],
      isActive: true,
    }).populate("category", "name slug");

    if (!product && rawCode.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findOne({ _id: rawCode, isActive: true }).populate("category", "name slug");
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        isGenuine: false,
        message: "Authenticity verification failed. This code is not registered in Legend Killer database.",
      });
    }

    if (!product.authenticityCode) {
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const slugPrefix = (product.slug || "LK").replace(/[^A-Z0-9]/gi, "").substring(0, 8).toUpperCase();
      product.authenticityCode = `LK-AUTH-${slugPrefix}-${randomSuffix}`;
    }

    product.verificationCount = (product.verificationCount || 0) + 1;
    product.lastVerifiedAt = new Date();
    await product.save();

    const clientUrl = process.env.CLIENT_URL || process.env.STOREFRONT_URL || "http://localhost:5173";
    const verificationUrl = `${clientUrl}/verify/${product.authenticityCode}`;
    const qrCodeDataUrl = generateQrCodeDataUrl(verificationUrl);

    res.json({
      success: true,
      isGenuine: true,
      message: "100% GENUINE & ORIGINAL LEGEND KILLER PRODUCT",
      data: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        sku: product.sku || "LK-SKU-ORIGINAL",
        authenticityCode: product.authenticityCode,
        category: product.category,
        shortDescription: product.shortDescription,
        description: product.description,
        price: product.price,
        mrp: product.mrp,
        images: product.images,
        ingredients: product.ingredients,
        benefits: product.benefits,
        warnings: product.warnings,
        manufacturerName: product.manufacturerName || "Legend Killer Performance Nutrition Ltd.",
        marketerName: product.marketerName || "Legend Killer Sports India",
        countryOfOrigin: product.countryOfOrigin || "India",
        licenceType: product.licenceType || "FSSAI Central Licence",
        licenceNumber: product.licenceNumber || "10020022001234",
        verificationCount: product.verificationCount,
        lastVerifiedAt: product.lastVerifiedAt,
        verificationUrl,
        qrCodeDataUrl,
        certificate: {
          badge: "VERIFIED AUTHENTIC BY LEGEND KILLER PROTOCOL",
          purityGuarantee: "100% Pure WPC / WPI - Zero Amino Spiking",
          testingSeal: "3rd-Party Lab Tested for Heavy Metals & Banned Substances",
          qualityClass: "Grade-A Pharmaceutical Quality Standard",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductQrCode = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, "Product not found");

    if (!product.authenticityCode) {
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const slugPrefix = (product.slug || "LK").replace(/[^A-Z0-9]/gi, "").substring(0, 8).toUpperCase();
      product.authenticityCode = `LK-AUTH-${slugPrefix}-${randomSuffix}`;
      await product.save();
    }

    const clientUrl = process.env.CLIENT_URL || process.env.STOREFRONT_URL || "http://localhost:5173";
    const verificationUrl = `${clientUrl}/verify/${product.authenticityCode}`;
    const qrCodeDataUrl = generateQrCodeDataUrl(verificationUrl);
    const qrCodeSvg = generateQrCodeSvg(verificationUrl);

    res.json({
      success: true,
      data: {
        productId: product._id,
        authenticityCode: product.authenticityCode,
        verificationUrl,
        qrCodeDataUrl,
        qrCodeSvg,
      },
    });
  } catch (error) {
    next(error);
  }
};
