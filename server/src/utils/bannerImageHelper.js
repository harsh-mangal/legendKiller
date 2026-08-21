import crypto from "crypto";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const uploadDir = path.join(process.cwd(), "uploads", "banners");

export const ensureBannerUploadDir = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

export const getBannerDefaultSize = (page = "home") => {
  if (page === "categories") {
    return {
      desktop: { width: 1920, height: 540 },
      mobile: { width: 1920, height: 960 },
      recommendedSize: {
        desktop: "1920 x 540 px",
        mobile: "1920 x 960 px",
      },
    };
  }

  return {
    desktop: { width: 1920, height: 540 },
    mobile: { width: 1920, height: 960 },
    recommendedSize: {
      desktop: "1920 x 540 px",
      mobile: "1920 x 960 px",
    },
  };
};

export const saveBannerMedia = async ({
  file,
  page,
  type = "desktop",
  width,
  height,
}) => {
  if (!file) return null;

  ensureBannerUploadDir();

  const isVideo =
    file.mimetype?.startsWith("video/") ||
    /\.(mp4|webm|mov|mkv|ogg)$/i.test(file.originalname || "");

  const finalWidth = Number(width) || (type === "desktop" ? 1920 : 1920);
  const finalHeight = Number(height) || (type === "desktop" ? 540 : 960);

  if (isVideo) {
    const ext =
      path.extname(file.originalname || "").toLowerCase().replace(".", "") ||
      (file.mimetype?.includes("webm") ? "webm" : "mp4");

    const safeName = `${page}-${type}-${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const finalPath = path.join(uploadDir, safeName);

    fs.writeFileSync(finalPath, file.buffer);

    const stats = fs.statSync(finalPath);

    return {
      url: `/uploads/banners/${safeName}`,
      width: finalWidth,
      height: finalHeight,
      sizeKB: Number((stats.size / 1024).toFixed(2)),
      originalName: file.originalname,
      format: ext,
      mediaType: "video",
    };
  }

  // Otherwise handle as Image
  const safeName = `${page}-${type}-${Date.now()}-${crypto.randomUUID()}.webp`;
  const finalPath = path.join(uploadDir, safeName);

  await sharp(file.buffer)
    .rotate()
    .resize({
      width: finalWidth,
      height: finalHeight,
      fit: "cover",
      position: "center",
    })
    .webp({
      quality: 85,
      effort: 5,
    })
    .toFile(finalPath);

  const stats = fs.statSync(finalPath);

  return {
    url: `/uploads/banners/${safeName}`,
    width: finalWidth,
    height: finalHeight,
    sizeKB: Number((stats.size / 1024).toFixed(2)),
    originalName: file.originalname,
    format: "webp",
    mediaType: "image",
  };
};

export const saveBannerWebp = saveBannerMedia;

export const deleteLocalFile = (fileUrl = "") => {
  try {
    if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;
    const uploadsRoot = path.resolve(process.cwd(), "uploads");
    const relativePath = fileUrl.replace(/^\/+uploads\//, "");
    const filePath = path.resolve(uploadsRoot, relativePath);
    if (!filePath.startsWith(`${uploadsRoot}${path.sep}`)) return;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Delete file error:", error.message);
  }
};