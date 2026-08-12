import crypto from "crypto";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const ensureFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

export const convertToWebpUnder200KB = async (file, folderName) => {
  const uploadDir = path.join(process.cwd(), "uploads", folderName);
  ensureFolder(uploadDir);

  const fileName = `${Date.now()}-${crypto.randomUUID()}.webp`;
  const filePath = path.join(uploadDir, fileName);

  let quality = 80;
  let width = 1200;
  let outputBuffer;

  while (quality >= 35) {
    outputBuffer = await sharp(file.buffer)
      .resize({
        width,
        withoutEnlargement: true,
      })
      .webp({
        quality,
      })
      .toBuffer();

    if (outputBuffer.length <= 200 * 1024) break;

    quality -= 10;
    width -= 150;
  }

  await fs.promises.writeFile(filePath, outputBuffer);

  return `/uploads/${folderName}/${fileName}`;
};

export const uploadMultipleImages = async (files, folderName) => {
  if (!files || files.length === 0) return [];

  const images = [];

  for (const file of files) {
    const imageUrl = await convertToWebpUnder200KB(file, folderName);
    images.push(imageUrl);
  }

  return images;
};