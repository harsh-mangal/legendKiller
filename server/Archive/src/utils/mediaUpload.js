import fs from "fs";
import path from "path";
import { convertToWebpUnder200KB } from "./imageUpload.js";

const ensureFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
};

const safeExt = (file) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (ext) return ext;
  if (file.mimetype?.includes("mp4")) return ".mp4";
  if (file.mimetype?.includes("webm")) return ".webm";
  if (file.mimetype?.includes("quicktime")) return ".mov";
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
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt(file)}`;
      const filePath = path.join(uploadDir, fileName);
      await fs.promises.writeFile(filePath, file.buffer);
      media.push({ type: "video", url: `/uploads/${folderName}/${fileName}` });
    }
  }

  return media;
};
