import multer from "multer";

const storage = multer.memoryStorage();
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedVideoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);

const fileFilter = (req, file, cb) => {
  if (["image", "images", "infographics"].includes(file.fieldname)) {
    if (allowedImageTypes.has(file.mimetype)) return cb(null, true);
    return cb(new Error("Product and infographic files must be JPG, PNG or WEBP"), false);
  }
  if (file.fieldname === "videos") {
    if (allowedVideoTypes.has(file.mimetype)) return cb(null, true);
    return cb(new Error("Product videos must be MP4, WEBM or MOV"), false);
  }
  if (allowedImageTypes.has(file.mimetype) || allowedVideoTypes.has(file.mimetype)) return cb(null, true);
  return cb(new Error("Only JPG, PNG, WEBP, MP4, WEBM and MOV files are allowed"), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Math.max(1, Number(process.env.MAX_UPLOAD_MB || 10)) * 1024 * 1024,
    files: 16,
    fields: 80,
    fieldSize: 1 * 1024 * 1024,
  },
});

export const uploadProductMedia = upload.fields([
  { name: "images", maxCount: 6 },
  { name: "infographics", maxCount: 8 },
  { name: "videos", maxCount: 2 },
]);
