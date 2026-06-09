import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { catalogAssetBucket, ensurePublicCatalogBucket } from "@/lib/storage";

export type MediaLibraryItem = {
  kind: string;
  label: string;
  source: string;
  file: string;
  size: number;
};

export const catalogDir = "public/catalog";

export function readMediaLibrary(root = process.cwd()) {
  return JSON.parse(
    fs.readFileSync(path.join(root, "extracted/metadata/media_library.json"), "utf8")
  ) as MediaLibraryItem[];
}

export function catalogFileName(input: string) {
  return input.replace(/[^\w.\-]/g, "_").replace(/\.(png|jpe?g|webp)$/i, ".webp");
}

export async function importPreparedCatalogAssets({
  root = process.cwd(),
  prisma = new PrismaClient()
}: {
  root?: string;
  prisma?: PrismaClient;
} = {}) {
  const media = readMediaLibrary(root);
  const supabase = await ensurePublicCatalogBucket();
  let uploaded = 0;
  for (const item of media) {
    const fileName = catalogFileName(item.file);
    const localPath = path.join(root, catalogDir, fileName);
    if (!fs.existsSync(localPath)) continue;
    const storagePath = `catalog/${fileName}`;
    const bytes = fs.readFileSync(localPath);
    const { error } = await supabase.storage.from(catalogAssetBucket).upload(storagePath, bytes, {
      contentType: "image/webp",
      upsert: true
    });
    if (error) throw new Error(`${fileName}: ${error.message}`);
    const { data } = supabase.storage.from(catalogAssetBucket).getPublicUrl(storagePath);
    await prisma.mediaAsset.updateMany({
      where: { filePath: item.file },
      data: {
        storagePath,
        publicUrl: data.publicUrl,
        thumbnailUrl: data.publicUrl
      }
    });
    uploaded += 1;
  }
  return { uploaded, total: media.length, bucket: catalogAssetBucket };
}
