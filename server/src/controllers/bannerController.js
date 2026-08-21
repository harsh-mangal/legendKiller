import Banner from "../models/bannerModel.js";
import {
  deleteLocalFile,
  getBannerDefaultSize,
  saveBannerMedia,
} from "../utils/bannerImageHelper.js";

const toBoolean = (value, defaultValue = true) => {
  if (value === undefined || value === null || value === "") return defaultValue;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return defaultValue;
};

const isVideoUrl = (url = "") => /\.(mp4|webm|mov|mkv|ogg)$/i.test(url);

const getFullUrl = (req, url = "") => {
  if (!url) return "";
  if (url.startsWith("http")) return url;

  return `${req.protocol}://${req.get("host")}${url}`;
};

const formatBanner = (req, banner) => {
  const item = banner.toObject ? banner.toObject() : banner;

  const desktopUrl = getFullUrl(req, item.image);
  const mobileUrl = getFullUrl(req, item.mobileImage);
  const mediaType = item.mediaType || (isVideoUrl(desktopUrl) ? "video" : "image");
  const mobileMediaType = item.mobileMediaType || (isVideoUrl(mobileUrl) ? "video" : "image");

  return {
    ...item,
    image: desktopUrl,
    mobileImage: mobileUrl,
    mediaType,
    mobileMediaType,
    imageMeta: {
      ...item.imageMeta,
      url: getFullUrl(req, item.imageMeta?.url),
      mediaType: item.imageMeta?.mediaType || mediaType,
    },
    mobileImageMeta: {
      ...item.mobileImageMeta,
      url: getFullUrl(req, item.mobileImageMeta?.url),
      mediaType: item.mobileImageMeta?.mediaType || mobileMediaType,
    },
  };
};

export const getPublicBanners = async (req, res) => {
  try {
    const { page } = req.query;

    const filter = { isActive: true };

    if (page) {
      filter.page = page;
    }

    const banners = await Banner.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: banners.map((banner) => formatBanner(req, banner)),
    });
  } catch (error) {
    console.error("Get public banners error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
    });
  }
};

export const getAllBanners = async (req, res) => {
  try {
    const { page, isActive } = req.query;

    const filter = {};

    if (page) filter.page = page;
    if (isActive === "true") filter.isActive = true;
    if (isActive === "false") filter.isActive = false;

    const banners = await Banner.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: banners.map((banner) => formatBanner(req, banner)),
    });
  } catch (error) {
    console.error("Get all banners error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
    });
  }
};

export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: formatBanner(req, banner),
    });
  } catch (error) {
    console.error("Get banner by id error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch banner",
    });
  }
};

export const createBanner = async (req, res) => {
  try {
    const {
      page,
      title = "",
      link = "",
      sortOrder = 0,
      isActive = true,
      width,
      height,
      mobileWidth,
      mobileHeight,
    } = req.body;

    if (!page || !["home", "categories"].includes(page)) {
      return res.status(400).json({
        success: false,
        message: "Valid page is required: home or categories",
      });
    }

    const defaults = getBannerDefaultSize(page);

    const desktopFile = req.files?.image?.[0];
    const mobileFile = req.files?.mobileImage?.[0];

    if (!desktopFile && !mobileFile) {
      return res.status(400).json({
        success: false,
        message: "At least one banner media file (Desktop or Mobile) is required",
      });
    }

    const desktopMeta = desktopFile
      ? await saveBannerMedia({
          file: desktopFile,
          page,
          type: "desktop",
          width: width || defaults.desktop.width,
          height: height || defaults.desktop.height,
        })
      : null;

    const mobileMeta = mobileFile
      ? await saveBannerMedia({
          file: mobileFile,
          page,
          type: "mobile",
          width: mobileWidth || defaults.mobile.width,
          height: mobileHeight || defaults.mobile.height,
        })
      : null;

    const primaryMeta = desktopMeta || mobileMeta;
    const secondaryMeta = mobileMeta || desktopMeta;

    const banner = await Banner.create({
      page,
      title,
      mediaType: primaryMeta?.mediaType || "image",
      mobileMediaType: secondaryMeta?.mediaType || "image",
      image: primaryMeta?.url || "",
      mobileImage: secondaryMeta?.url || primaryMeta?.url || "",
      imageMeta: primaryMeta || {},
      mobileImageMeta: secondaryMeta || primaryMeta || {},
      recommendedSize: defaults.recommendedSize,
      link,
      sortOrder: Number(sortOrder || 0),
      isActive: toBoolean(isActive, true),
    });

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: formatBanner(req, banner),
    });
  } catch (error) {
    console.error("Create banner error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create banner",
    });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    const {
      page,
      title,
      link,
      sortOrder,
      isActive,
      width,
      height,
      mobileWidth,
      mobileHeight,
    } = req.body;

    const finalPage = page || banner.page;

    if (!["home", "categories"].includes(finalPage)) {
      return res.status(400).json({
        success: false,
        message: "Valid page is required: home or categories",
      });
    }

    const defaults = getBannerDefaultSize(finalPage);

    const desktopFile = req.files?.image?.[0];
    const mobileFile = req.files?.mobileImage?.[0];

    if (!banner.image && !banner.mobileImage && !desktopFile && !mobileFile) {
      return res.status(400).json({
        success: false,
        message: "At least one banner media file is required",
      });
    }

    if (desktopFile) {
      if (banner.image !== banner.mobileImage) {
        deleteLocalFile(banner.image);
      }

      const desktopMeta = await saveBannerMedia({
        file: desktopFile,
        page: finalPage,
        type: "desktop",
        width: width || defaults.desktop.width,
        height: height || defaults.desktop.height,
      });

      banner.image = desktopMeta.url;
      banner.imageMeta = desktopMeta;
      banner.mediaType = desktopMeta.mediaType || "image";

      // If mobileImage was fallback to same old desktop image, update mobile too
      if (!banner.mobileImage || banner.mobileImage === banner.image) {
        banner.mobileImage = desktopMeta.url;
        banner.mobileImageMeta = desktopMeta;
        banner.mobileMediaType = desktopMeta.mediaType || "image";
      }
    }

    if (mobileFile) {
      if (banner.mobileImage !== banner.image) {
        deleteLocalFile(banner.mobileImage);
      }

      const mobileMeta = await saveBannerMedia({
        file: mobileFile,
        page: finalPage,
        type: "mobile",
        width: mobileWidth || defaults.mobile.width,
        height: mobileHeight || defaults.mobile.height,
      });

      banner.mobileImage = mobileMeta.url;
      banner.mobileImageMeta = mobileMeta;
      banner.mobileMediaType = mobileMeta.mediaType || "image";
    }

    if (page !== undefined) banner.page = page;
    if (title !== undefined) banner.title = title;
    if (link !== undefined) banner.link = link;
    if (sortOrder !== undefined) banner.sortOrder = Number(sortOrder || 0);
    if (isActive !== undefined) banner.isActive = toBoolean(isActive, true);

    banner.recommendedSize = defaults.recommendedSize;

    await banner.save();

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: formatBanner(req, banner),
    });
  } catch (error) {
    console.error("Update banner error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update banner",
    });
  }
};

export const toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    return res.status(200).json({
      success: true,
      message: `Banner ${
        banner.isActive ? "activated" : "deactivated"
      } successfully`,
      data: formatBanner(req, banner),
    });
  } catch (error) {
    console.error("Toggle banner status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update banner status",
    });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    deleteLocalFile(banner.image);
    deleteLocalFile(banner.mobileImage);

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Delete banner error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete banner",
    });
  }
};