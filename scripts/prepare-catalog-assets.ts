import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { catalogDir, catalogFileName, readMediaLibrary } from "@/lib/catalog-assets";

const root = process.cwd();
const outputDir = path.join(root, catalogDir);

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const media = readMediaLibrary(root);
  let compressed = 0;
  for (const item of media) {
    const inputPath = path.join(root, item.file);
    if (!fs.existsSync(inputPath)) continue;
    const outputPath = path.join(outputDir, catalogFileName(item.file));
    const image = sharp(inputPath, { failOn: "none" });
    const metadata = await image.metadata();
    await image
      .resize({ width: metadata.width && metadata.width > 1800 ? 1800 : undefined, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(outputPath);
    compressed += 1;
  }
  console.log(`Prepared ${compressed}/${media.length} compressed catalog assets in ${catalogDir}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
