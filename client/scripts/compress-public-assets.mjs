import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const serverSharp = path.resolve(root, "../server/node_modules/sharp/lib/index.js");

async function compress() {
  console.log("Compressing public images using sharp...");
  const { default: sharp } = await import(`file://${serverSharp}`);

  // 1. Compress og-social.jpg to 1200x630 JPEG (~80-150 KB)
  const ogPath = path.join(publicDir, "og-social.jpg");
  try {
    const ogBuffer = await sharp(ogPath)
      .resize(1200, 630, { fit: "cover" })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();
    await writeFile(ogPath, ogBuffer);
    console.log(`og-social.jpg compressed: ${(ogBuffer.length / 1024).toFixed(1)} KB`);
  } catch (err) {
    console.error("Failed to compress og-social.jpg:", err.message);
  }

  // 2. Compress logo.png to 512x512 PNG
  const logoPath = path.join(publicDir, "logo.png");
  try {
    const logoBuffer = await sharp(logoPath)
      .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
    await writeFile(logoPath, logoBuffer);
    console.log(`logo.png compressed: ${(logoBuffer.length / 1024).toFixed(1)} KB`);
  } catch (err) {
    console.error("Failed to compress logo.png:", err.message);
  }

  // 3. Compress icon-512.png
  const icon512Path = path.join(publicDir, "icon-512.png");
  try {
    const icon512Buffer = await sharp(icon512Path)
      .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
    await writeFile(icon512Path, icon512Buffer);
    console.log(`icon-512.png compressed: ${(icon512Buffer.length / 1024).toFixed(1)} KB`);
  } catch (err) {
    console.error("Failed to compress icon-512.png:", err.message);
  }

  // 4. Compress icon-192.png
  const icon192Path = path.join(publicDir, "icon-192.png");
  try {
    const icon192Buffer = await sharp(icon192Path)
      .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
    await writeFile(icon192Path, icon192Buffer);
    console.log(`icon-192.png compressed: ${(icon192Buffer.length / 1024).toFixed(1)} KB`);
  } catch (err) {
    console.error("Failed to compress icon-192.png:", err.message);
  }

  // 5. Compress favicon-64.png
  const favicon64Path = path.join(publicDir, "favicon-64.png");
  try {
    const favBuffer = await sharp(favicon64Path)
      .resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
    await writeFile(favicon64Path, favBuffer);
    console.log(`favicon-64.png compressed: ${(favBuffer.length / 1024).toFixed(1)} KB`);
  } catch (err) {
    console.error("Failed to compress favicon-64.png:", err.message);
  }
}

compress();
