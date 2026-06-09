import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";
import { catalogAssetBucket, ensurePublicCatalogBucket } from "@/lib/storage";

type MediaLibraryItem = {
  kind: string;
  label: string;
  source: string;
  file: string;
  size: number;
};

const root = process.cwd();
const prisma = new PrismaClient();
const cacheDir = path.join(root, ".asset-cache");

function safeName(input: string) {
  return input.replace(/[^\w.\-]/g, "_").replace(/\.(png|jpe?g|webp)$/i, ".webp");
}

async function compressImage(inputPath: string, outputPath: string) {
  const image = sharp(inputPath, { failOn: "none" });
  const metadata = await image.metadata();
  const width = metadata.width && metadata.width > 1800 ? 1800 : metadata.width;
  await image
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(outputPath);
  const compressed = await sharp(outputPath).metadata();
  const stat = fs.statSync(outputPath);
  return {
    width: compressed.width ?? metadata.width ?? null,
    height: compressed.height ?? metadata.height ?? null,
    compressedSize: stat.size
  };
}

async function main() {
  fs.mkdirSync(cacheDir, { recursive: true });
  const media = JSON.parse(
    fs.readFileSync(path.join(root, "extracted/metadata/media_library.json"), "utf8")
  ) as MediaLibraryItem[];
  const supabase = await ensurePublicCatalogBucket();

  let uploaded = 0;
  for (const item of media) {
    const sourcePath = path.join(root, item.file);
    if (!fs.existsSync(sourcePath)) continue;
    const outputName = safeName(item.file);
    const outputPath = path.join(cacheDir, outputName);
    const compressed = await compressImage(sourcePath, outputPath);
    const storagePath = `catalog/${outputName}`;
    const bytes = fs.readFileSync(outputPath);
    const { error } = await supabase.storage.from(catalogAssetBucket).upload(storagePath, bytes, {
      contentType: "image/webp",
      upsert: true
    });
    if (error) throw new Error(`${item.file}: ${error.message}`);
    const { data } = supabase.storage.from(catalogAssetBucket).getPublicUrl(storagePath);
    await prisma.mediaAsset.updateMany({
      where: { filePath: item.file },
      data: {
        storagePath,
        publicUrl: data.publicUrl,
        thumbnailUrl: data.publicUrl,
        compressedSize: compressed.compressedSize,
        width: compressed.width,
        height: compressed.height
      }
    });
    uploaded += 1;
  }
  console.log(`Imported ${uploaded}/${media.length} catalog assets into ${catalogAssetBucket}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
