import { execFile } from "child_process";
import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import sharp from "sharp";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const uploadDir = path.join(process.cwd(), "uploads", "banners");

export const ensureBannerUploadDir = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

export const getBannerDefaultSize = (page = "home") => {
  if (page === "categories") {
    return {
      desktop: { width: 1920, height: 540 },
      mobile: { width: 1920, height: 960 },
      recommendedSize: {
        desktop: "1920 x 540 px",
        mobile: "1920 x 960 px",
      },
    };
  }

  return {
    desktop: { width: 1920, height: 540 },
    mobile: { width: 1920, height: 960 },
    recommendedSize: {
      desktop: "1920 x 540 px",
      mobile: "1920 x 960 px",
    },
  };
};

const compressAndOptimizeVideo = async (inputPath, outputPath) => {
  try {
    const args = [
      "-y",
      "-i",
      inputPath,
      "-vf",
      "scale='min(1920,iw)':'-2',fps=30",
      "-c:v",
      "libx264",
      "-preset",
      "faster",
      "-crf",
      "25",
      "-maxrate",
      "3M",
      "-bufsize",
      "6M",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-ar",
      "44100",
      "-movflags",
      "+faststart",
      outputPath,
    ];
    await execFileAsync("ffmpeg", args, { timeout: 180000 });
    return true;
  } catch (error) {
    console.warn(
      "FFmpeg video compression failed or unavailable, saving original file:",
      error.message
    );
    return false;
  }
};

export const saveBannerMedia = async ({
  file,
  page,
  type = "desktop",
  width,
  height,
}) => {
  if (!file) return null;

  ensureBannerUploadDir();

  const isVideo =
    file.mimetype?.startsWith("video/") ||
    /\.(mp4|webm|mov|mkv|ogg)$/i.test(file.originalname || "");

  const finalWidth = Number(width) || (type === "desktop" ? 1920 : 1920);
  const finalHeight = Number(height) || (type === "desktop" ? 540 : 960);

  if (isVideo) {
    const safeName = `${page}-${type}-${Date.now()}-${crypto.randomUUID()}.mp4`;
    const finalPath = path.join(uploadDir, safeName);

    let tempInputPath = null;
    let inputSource = null;

    if (file.path && fs.existsSync(file.path)) {
      inputSource = file.path;
    } else if (file.buffer) {
      tempInputPath = path.join(
        os.tmpdir(),
        `temp-vid-${Date.now()}-${crypto.randomUUID()}`
      );
      fs.writeFileSync(tempInputPath, file.buffer);
      inputSource = tempInputPath;
    }

    let compressedSuccess = false;
    if (inputSource && fs.existsSync(inputSource)) {
      compressedSuccess = await compressAndOptimizeVideo(
        inputSource,
        finalPath
      );
    }

    if (!compressedSuccess && inputSource && fs.existsSync(inputSource)) {
      fs.copyFileSync(inputSource, finalPath);
    }

    if (tempInputPath && fs.existsSync(tempInputPath)) {
      try {
        fs.unlinkSync(tempInputPath);
      } catch (_) {}
    }
    if (file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (_) {}
    }

    const stats = fs.statSync(finalPath);

    return {
      url: `/uploads/banners/${safeName}`,
      width: finalWidth,
      height: finalHeight,
      sizeKB: Number((stats.size / 1024).toFixed(2)),
      originalName: file.originalname,
      format: "mp4",
      mediaType: "video",
    };
  }

  // Otherwise handle as Image
  const safeName = `${page}-${type}-${Date.now()}-${crypto.randomUUID()}.webp`;
  const finalPath = path.join(uploadDir, safeName);
  const inputSource =
    file.path && fs.existsSync(file.path) ? file.path : file.buffer;

  await sharp(inputSource)
    .rotate()
    .resize({
      width: finalWidth,
      height: finalHeight,
      fit: "cover",
      position: "center",
    })
    .webp({
      quality: 85,
      effort: 5,
    })
    .toFile(finalPath);

  if (file.path && fs.existsSync(file.path)) {
    try {
      fs.unlinkSync(file.path);
    } catch (_) {}
  }

  const stats = fs.statSync(finalPath);

  return {
    url: `/uploads/banners/${safeName}`,
    width: finalWidth,
    height: finalHeight,
    sizeKB: Number((stats.size / 1024).toFixed(2)),
    originalName: file.originalname,
    format: "webp",
    mediaType: "image",
  };
};

export const saveBannerWebp = saveBannerMedia;

export const deleteLocalFile = (fileUrl = "") => {
  try {
    if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;
    const uploadsRoot = path.resolve(process.cwd(), "uploads");
    const relativePath = fileUrl.replace(/^\/+uploads\//, "");
    const filePath = path.resolve(uploadsRoot, relativePath);
    if (!filePath.startsWith(`${uploadsRoot}${path.sep}`)) return;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Delete file error:", error.message);
  }
};