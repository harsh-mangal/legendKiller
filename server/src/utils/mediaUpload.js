import crypto from "crypto";
import fs from "fs";
import path from "path";
import { convertToWebpUnder200KB } from "./imageUpload.js";

const ensureFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
};

const safeExt = (file) => {
  if (file.mimetype === "video/mp4") return ".mp4";
  if (file.mimetype === "video/webm") return ".webm";
  if (file.mimetype === "video/quicktime") return ".mov";
  return ".bin";
};

export const saveReviewMediaFiles = async (files = [], folderName = "reviews") => {
  const media = [];
  const uploadDir = path.join(process.cwd(), "uploads", folderName);
  ensureFolder(uploadDir);

  for (const file of files || []) {
    if (file.mimetype?.startsWith("image/")) {
      const url = await convertToWebpUnder200KB(file, folderName);
      media.push({ type: "image", url });
      continue;
    }

    if (file.mimetype?.startsWith("video/")) {
      const fileName = `${Date.now()}-${crypto.randomUUID()}${safeExt(file)}`;
      const filePath = path.join(uploadDir, fileName);
      await fs.promises.writeFile(filePath, file.buffer);
      media.push({ type: "video", url: `/uploads/${folderName}/${fileName}` });
    }
  }

  return media;
};

export const saveVideoFiles = async (files = [], folderName = "product-videos") => {
  const uploadDir = path.join(process.cwd(), "uploads", folderName);
  ensureFolder(uploadDir);
  const urls = [];

  for (const file of files || []) {
    if (!file.mimetype?.startsWith("video/")) continue;
    const fileName = `${Date.now()}-${crypto.randomUUID()}${safeExt(file)}`;
    await fs.promises.writeFile(path.join(uploadDir, fileName), file.buffer);
    urls.push(`/uploads/${folderName}/${fileName}`);
  }

  return urls;
};
