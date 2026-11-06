import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { ApiError } from "./apiError.js";

export const validatePdfFile = (file) => {
  if (file && (file.mimetype !== "application/pdf" || file.buffer?.subarray(0, 5).toString() !== "%PDF-")) {
    throw new ApiError(400, "Upload a valid PDF document");
  }
};

export const saveNutritionPdf = async (file) => {
  if (!file) return "";
  validatePdfFile(file);
  const directory = path.join(process.cwd(), "uploads", "product-nutrition");
  await fs.mkdir(directory, { recursive: true });
  const filename = `${crypto.randomUUID()}.pdf`;
  await fs.writeFile(path.join(directory, filename), file.buffer);
  return `/uploads/product-nutrition/${filename}`;
};
