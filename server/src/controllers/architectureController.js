import Architecture from "../models/Architecture.js";
import { DEFAULT_ARCHITECTURES } from "../data/architecturesData.js";

let syncPromise;
const syncSuppliedArchitectures = async () => {
  if (!syncPromise) {
    syncPromise = (async () => {
      for (const item of DEFAULT_ARCHITECTURES) {
        const existing = await Architecture.findOne({ slug: item.slug }).select("contentVersion");
        if (!existing) await Architecture.create(item);
        else if (existing.contentVersion !== 1) await Architecture.updateOne({ _id: existing._id }, { $set: item });
      }
      await Architecture.updateOne(
        { slug: "absorption-cofactor-matrix", contentVersion: { $ne: 1 } },
        { $set: { isActive: false, contentVersion: 1 } }
      );
    })().catch((error) => { syncPromise = null; throw error; });
  }
  await syncPromise;
};

export const getArchitectures = async (req, res, next) => {
  try {
    await syncSuppliedArchitectures();
    const items = await Architecture.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });

    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

export const getAdminArchitectures = async (req, res, next) => {
  try {
    await syncSuppliedArchitectures();
    const items = await Architecture.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) { next(error); }
};

export const getArchitectureBySlug = async (req, res, next) => {
  try {
    await syncSuppliedArchitectures();
    const { slug } = req.params;
    let item = await Architecture.findOne({
      isActive: true,
      $or: [{ slug: slug.toLowerCase() }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }],
    });

    if (!item) {
      return res.status(404).json({ success: false, message: "Architecture not found" });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const createArchitecture = async (req, res, next) => {
  try {
    const { title, slug, subtitle, category, badge, icon, logoUrl, shortDescription, overview, pillars, emergentOutcomes, chapters, sortOrder, isActive } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ success: false, message: "Title and slug are required" });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
    const existing = await Architecture.findOne({ slug: cleanSlug });
    if (existing) {
      return res.status(400).json({ success: false, message: "Architecture slug already exists" });
    }

    const architecture = await Architecture.create({
      title,
      slug: cleanSlug,
      subtitle: subtitle || "",
      category: category || "Viper Protocol",
      badge: badge || "5 Pillars",
      icon: icon || "Zap",
      logoUrl: logoUrl || "",
      shortDescription: shortDescription || "",
      overview: overview || "",
      pillars: pillars || [],
      emergentOutcomes: emergentOutcomes || [],
      chapters: chapters || [],
      sortOrder: sortOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, data: architecture });
  } catch (error) {
    next(error);
  }
};

export const updateArchitecture = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, subtitle, category, badge, icon, logoUrl, shortDescription, overview, pillars, emergentOutcomes, chapters, sortOrder, isActive } = req.body;

    const architecture = await Architecture.findById(id);
    if (!architecture) {
      return res.status(404).json({ success: false, message: "Architecture not found" });
    }

    if (slug && slug.toLowerCase() !== architecture.slug) {
      const cleanSlug = slug.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
      const existing = await Architecture.findOne({ slug: cleanSlug, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ success: false, message: "Architecture slug already exists" });
      }
      architecture.slug = cleanSlug;
    }

    if (title) architecture.title = title;
    if (subtitle !== undefined) architecture.subtitle = subtitle;
    if (category !== undefined) architecture.category = category;
    if (badge !== undefined) architecture.badge = badge;
    if (icon !== undefined) architecture.icon = icon;
    if (logoUrl !== undefined) architecture.logoUrl = logoUrl;
    if (shortDescription !== undefined) architecture.shortDescription = shortDescription;
    if (overview !== undefined) architecture.overview = overview;
    if (pillars !== undefined) architecture.pillars = pillars;
    if (emergentOutcomes !== undefined) architecture.emergentOutcomes = emergentOutcomes;
    if (chapters !== undefined) architecture.chapters = chapters;
    if (sortOrder !== undefined) architecture.sortOrder = sortOrder;
    if (isActive !== undefined) architecture.isActive = isActive;

    await architecture.save();

    res.json({ success: true, data: architecture });
  } catch (error) {
    next(error);
  }
};

export const deleteArchitecture = async (req, res, next) => {
  try {
    const { id } = req.params;
    const architecture = await Architecture.findByIdAndDelete(id);
    if (!architecture) {
      return res.status(404).json({ success: false, message: "Architecture not found" });
    }
    res.json({ success: true, message: "Architecture deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const seedArchitectures = async (req, res, next) => {
  try {
    await Architecture.deleteMany({});
    const items = await Architecture.insertMany(DEFAULT_ARCHITECTURES);
    res.json({ success: true, message: "Seeded default architectures successfully", count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};
