import multer from "multer";
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => allowedMimeTypes.has(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only JPG, PNG and WEBP images are allowed"), false),
  limits: { fileSize: 5 * 1024 * 1024, files: 2, fields: 20 },
});
export const uploadBannerImages = upload.fields([{ name: "image", maxCount: 1 }, { name: "mobileImage", maxCount: 1 }]);
