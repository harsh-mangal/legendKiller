import crypto from "crypto";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const ensureFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

export const convertToWebpUnder200KB = async (file, folderName, options = {}) => {
  const uploadDir = path.join(process.cwd(), "uploads", folderName);
  ensureFolder(uploadDir);

  const fileName = `${Date.now()}-${crypto.randomUUID()}.webp`;
  const filePath = path.join(uploadDir, fileName);

  const maxBytes = Number(options.maxBytes || 200 * 1024);
  const minQuality = Number(options.minQuality || 35);
  const qualityStep = Number(options.qualityStep || 10);
  const widthStep = Number(options.widthStep || 150);
  let quality = Number(options.quality || 80);
  let width = Number(options.width || 1200);
  let outputBuffer;

  while (quality >= minQuality) {
    outputBuffer = await sharp(file.buffer)
      .resize({
        width,
        withoutEnlargement: true,
      })
      .webp({
        quality,
      })
      .toBuffer();

    if (outputBuffer.length <= maxBytes) break;

    quality -= qualityStep;
    width = Math.max(640, width - widthStep);
  }

  await fs.promises.writeFile(filePath, outputBuffer);

  return `/uploads/${folderName}/${fileName}`;
};

export const uploadMultipleImages = async (files, folderName, options = {}) => {
  if (!files || files.length === 0) return [];

  const images = [];

  for (const file of files) {
    const imageUrl = await convertToWebpUnder200KB(file, folderName, options);
    images.push(imageUrl);
  }

  return images;
};

export const deleteUploadedImages = async (fileUrls = []) => {
  const uploadsRoot = path.resolve(process.cwd(), "uploads");

  await Promise.all((fileUrls || []).map(async (fileUrl) => {
    const value = String(fileUrl || "").trim();
    if (!value || /^https?:/i.test(value) || !value.startsWith("/uploads/")) return;

    const filePath = path.resolve(process.cwd(), value.replace(/^\/+/, ""));
    if (filePath !== uploadsRoot && !filePath.startsWith(`${uploadsRoot}${path.sep}`)) return;

    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      if (error.code !== "ENOENT") console.warn(`Product image cleanup failed for ${value}:`, error.message);
    }
  }));
};
