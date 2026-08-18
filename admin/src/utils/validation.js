export const isFiniteNumber = (value) => Number.isFinite(Number(value));

export const toFiniteNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const isWholeNumber = (value) => Number.isInteger(Number(value));

export const validateIndianPincodes = (values = []) => {
  const normalized = [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
  const invalid = normalized.filter((value) => !/^[1-9][0-9]{5}$/.test(value));
  return { normalized, invalid };
};

export const intersect = (left = [], right = []) => {
  const rightSet = new Set(right);
  return [...new Set(left.filter((value) => rightSet.has(value)))];
};

export const couponCodeIsValid = (value) => /^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(String(value || "").trim().toUpperCase());

const dateAtLocalTime = (value, endOfDay = false) => {
  if (!value) return null;
  const suffix = endOfDay ? "T23:59:59.999" : "T00:00:00.000";
  const date = new Date(`${value}${suffix}`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const startOfInputDateIso = (value) => dateAtLocalTime(value, false);
export const endOfInputDateIso = (value) => dateAtLocalTime(value, true);

const DEFAULT_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const validateImageFiles = (files = [], { maxFiles = 6, maxMb = 10, allowedTypes = DEFAULT_IMAGE_TYPES } = {}) => {
  const list = Array.from(files || []);
  if (list.length > maxFiles) return `Select no more than ${maxFiles} images.`;
  const invalidType = list.find((file) => !allowedTypes.has(file.type));
  if (invalidType) return `${invalidType.name || "An image"} must be JPG, PNG or WEBP.`;
  const maximumBytes = maxMb * 1024 * 1024;
  const oversized = list.find((file) => Number(file.size || 0) > maximumBytes);
  if (oversized) return `${oversized.name || "An image"} must be smaller than ${maxMb} MB.`;
  return "";
};

const DEFAULT_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime", "video/ogg", "video/x-matroska"]);

export const validateVideoFiles = (files = [], { maxFiles = 2, maxMb = 100, allowedTypes = DEFAULT_VIDEO_TYPES } = {}) => {
  const list = Array.from(files || []);
  if (list.length > maxFiles) return `Select no more than ${maxFiles} videos.`;
  const invalidType = list.find((file) => !allowedTypes.has(file.type));
  if (invalidType) return `${invalidType.name || "A video"} must be MP4, WEBM or MOV.`;
  const maximumBytes = maxMb * 1024 * 1024;
  const oversized = list.find((file) => Number(file.size || 0) > maximumBytes);
  if (oversized) return `${oversized.name || "A video"} must be smaller than ${maxMb} MB.`;
  return "";
};

const DEFAULT_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
  "video/x-matroska",
]);

export const validateMediaFiles = (files = [], { maxFiles = 2, maxMb = 100, allowedTypes = DEFAULT_MEDIA_TYPES } = {}) => {
  const list = Array.from(files || []);
  if (list.length > maxFiles) return `Select no more than ${maxFiles} files.`;
  const invalidType = list.find((file) => {
    if (allowedTypes.has(file.type)) return false;
    if (file.type?.startsWith("image/") || file.type?.startsWith("video/")) return false;
    if (/\.(jpg|jpeg|png|webp|gif|mp4|webm|mov|ogg|mkv)$/i.test(file.name || "")) return false;
    return true;
  });
  if (invalidType) return `${invalidType.name || "File"} must be JPG, PNG, WEBP image or MP4, WEBM, MOV video.`;
  const maximumBytes = maxMb * 1024 * 1024;
  const oversized = list.find((file) => Number(file.size || 0) > maximumBytes);
  if (oversized) return `${oversized.name || "File"} must be smaller than ${maxMb} MB.`;
  return "";
};

