import fs from "fs";
import os from "os";
import path from "path";
import multer from "multer";

const tempDir = path.join(os.tmpdir(), "legendkiller-banner-uploads");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || "") || "";
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-matroska",
]);

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      allowedMimeTypes.has(file.mimetype) ||
      file.mimetype?.startsWith("video/") ||
      file.mimetype?.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, PNG, WEBP images or MP4, WEBM, MOV videos are allowed"
        ),
        false
      );
    }
  },
  limits: { fileSize: 200 * 1024 * 1024, files: 2, fields: 20 },
});

const bannerFieldsMiddleware = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "mobileImage", maxCount: 1 },
]);

export const uploadBannerImages = (req, res, next) => {
  bannerFieldsMiddleware(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size exceeds limit (Max 200MB per banner media)",
          });
        }
        return res.status(400).json({ success: false, message: err.message });
      }
      return res
        .status(400)
        .json({ success: false, message: err.message || "File upload failed" });
    }
    next();
  });
};
