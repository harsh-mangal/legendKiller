import sharp from "sharp";
import path from "path";
import { mkdir, copyFile } from "fs/promises";

const sourceImage = "/Users/harshmangal/.gemini/antigravity/brain/a469730d-548d-40c6-acd9-14067428ab6f/.user_uploaded/media_1787431427378.png";
const clientPublic = "/Users/harshmangal/Documents/GitHub/legendKiller/client/public";
const adminPublic = "/Users/harshmangal/Documents/GitHub/legendKiller/admin/public";

async function generateAssets() {
  console.log("Generating brand assets from source:", sourceImage);

  // 1. Generate client/public/logo.png (512x512 PNG)
  const logo512 = await sharp(sourceImage)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .png({ quality: 100 })
    .toBuffer();
  await sharp(logo512).toFile(path.join(clientPublic, "logo.png"));
  await sharp(logo512).toFile(path.join(clientPublic, "icon-512.png"));
  console.log("✓ client logo.png and icon-512.png generated");

  // 2. Generate client/public/icon-192.png (192x192 PNG)
  const icon192 = await sharp(sourceImage)
    .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .png({ quality: 100 })
    .toBuffer();
  await sharp(icon192).toFile(path.join(clientPublic, "icon-192.png"));
  console.log("✓ client icon-192.png generated");

  // 3. Generate client/public/favicon-64.png and favicon.ico (64x64 PNG)
  const fav64 = await sharp(sourceImage)
    .resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .png({ quality: 100 })
    .toBuffer();
  await sharp(fav64).toFile(path.join(clientPublic, "favicon-64.png"));
  await sharp(fav64).toFile(path.join(clientPublic, "favicon.ico"));
  console.log("✓ client favicon-64.png and favicon.ico generated");

  // 4. Generate client/public/apple-touch-icon.png (180x180 PNG)
  const appleTouch = await sharp(sourceImage)
    .resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .png({ quality: 100 })
    .toBuffer();
  await sharp(appleTouch).toFile(path.join(clientPublic, "apple-touch-icon.png"));
  console.log("✓ client apple-touch-icon.png generated");

  // 5. Generate Open Graph 1200x630 social card (og-social.jpg)
  const logoCenter = await sharp(sourceImage)
    .resize(560, 560, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .composite([
      {
        input: logoCenter,
        top: 35,
        left: 320,
      },
    ])
    .jpeg({ quality: 95 })
    .toFile(path.join(clientPublic, "og-social.jpg"));
  console.log("✓ client og-social.jpg (1200x630) generated");

  // 6. Generate Admin portal assets
  await sharp(logo512).toFile(path.join(adminPublic, "admin-logo.png"));
  await sharp(icon192).toFile(path.join(adminPublic, "admin-icon-192.png"));
  const adminIcon128 = await sharp(sourceImage)
    .resize(128, 128, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .png({ quality: 100 })
    .toBuffer();
  await sharp(adminIcon128).toFile(path.join(adminPublic, "admin-icon.png"));
  await sharp(fav64).toFile(path.join(adminPublic, "favicon.ico"));
  console.log("✓ admin portal assets generated");

  console.log("\nALL BRAND ASSETS GENERATED AND INSTALLED SUCCESSFULLY!");
}

generateAssets().catch((err) => {
  console.error("Asset generation error:", err);
  process.exit(1);
});
