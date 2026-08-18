import multer from "multer";

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
  storage: multer.memoryStorage(),
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
  limits: { fileSize: 100 * 1024 * 1024, files: 2, fields: 20 },
});

export const uploadBannerImages = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "mobileImage", maxCount: 1 },
]);
