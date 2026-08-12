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
      desktop: { width: 1600, height: 420 },
      mobile: { width: 750, height: 260 },
      recommendedSize: {
        desktop: "1600 x 420 px",
        mobile: "750 x 260 px",
      },
    };
  }

  return {
    desktop: { width: 1600, height: 650 },
    mobile: { width: 750, height: 420 },
    recommendedSize: {
      desktop: "1600 x 650 px",
      mobile: "750 x 420 px",
    },
  };
};

export const saveBannerWebp = async ({
  file,
  page,
  type = "desktop",
  width,
  height,
}) => {
  if (!file) return null;

  ensureBannerUploadDir();

  const finalWidth = Number(width);
  const finalHeight = Number(height);

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
      quality: 82,
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
  };
};

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