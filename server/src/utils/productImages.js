import { ApiError } from "./apiError.js";

export const PRODUCT_IMAGE_LIMIT = 10;

const parseRetainedImages = (value) => {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(String(value));
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  throw new ApiError(400, "The retained product image list is invalid");
};

export const planProductImageUpdate = ({
  currentImages = [],
  retainedImagesValue,
  newImageCount = 0,
  maxImages = PRODUCT_IMAGE_LIMIT,
} = {}) => {
  const current = [...new Set((currentImages || []).map(String).filter(Boolean))];
  const requested = parseRetainedImages(retainedImagesValue);
  const shouldUpdate = requested !== null || Number(newImageCount) > 0;

  if (!shouldUpdate) {
    return { shouldUpdate: false, retainedImages: current, removedImages: [] };
  }

  const retainedImages = requested === null
    ? current
    : [...new Set(requested.map((value) => String(value || "").trim()).filter(Boolean))];
  const currentSet = new Set(current);
  if (retainedImages.some((image) => !currentSet.has(image))) {
    throw new ApiError(400, "One or more retained product images do not belong to this product");
  }

  if (retainedImages.length + Number(newImageCount || 0) > maxImages) {
    throw new ApiError(400, `A product can have no more than ${maxImages} images`);
  }

  const retainedSet = new Set(retainedImages);
  return {
    shouldUpdate: true,
    retainedImages,
    removedImages: current.filter((image) => !retainedSet.has(image)),
  };
};
