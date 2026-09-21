import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import express from "express";
import multer from "multer";
import Patent from "../models/Patent.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { ApiError } from "../utils/apiError.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 }, fileFilter(req, file, callback) {
  callback(file.mimetype === "application/pdf" ? null : new Error("Only PDF patents are supported"), file.mimetype === "application/pdf");
} });

router.get("/", async (req, res, next) => {
  try { res.json({ success: true, data: await Patent.find({ isPublished: true }).sort({ createdAt: -1 }) }); }
  catch (error) { next(error); }
});
router.get("/admin", protect, adminOnly, async (req, res, next) => {
  try { res.json({ success: true, data: await Patent.find().sort({ createdAt: -1 }) }); }
  catch (error) { next(error); }
});
router.post("/", protect, adminOnly, upload.single("file"), async (req, res, next) => {
  try {
    const title = String(req.body.title || "").trim();
    if (!title || !req.file) throw new ApiError(400, "Title and PDF are required");
    if (req.file.buffer.subarray(0, 5).toString() !== "%PDF-") throw new ApiError(400, "Invalid PDF file");
    const directory = path.join(process.cwd(), "uploads", "patents");
    await fs.mkdir(directory, { recursive: true });
    const filename = `${crypto.randomUUID()}.pdf`;
    await fs.writeFile(path.join(directory, filename), req.file.buffer);
    const item = await Patent.create({ title, description: String(req.body.description || "").trim(), fileUrl: `/uploads/patents/${filename}`, isPublished: req.body.isPublished !== "false" });
    res.status(201).json({ success: true, data: item });
  } catch (error) { next(error); }
});
router.patch("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const item = await Patent.findById(req.params.id);
    if (!item) throw new ApiError(404, "Patent not found");
    if (req.body.title !== undefined) item.title = String(req.body.title).trim();
    if (req.body.description !== undefined) item.description = String(req.body.description).trim();
    if (req.body.isPublished !== undefined) item.isPublished = Boolean(req.body.isPublished);
    await item.save();
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
});
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const item = await Patent.findByIdAndDelete(req.params.id);
    if (!item) throw new ApiError(404, "Patent not found");
    if (item.fileUrl.startsWith("/uploads/patents/")) await fs.unlink(path.join(process.cwd(), item.fileUrl.slice(1))).catch(() => {});
    res.json({ success: true });
  } catch (error) { next(error); }
});

export default router;
