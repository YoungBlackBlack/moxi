ALTER TABLE "MediaAsset"
  ADD COLUMN "storagePath" TEXT,
  ADD COLUMN "publicUrl" TEXT,
  ADD COLUMN "thumbnailUrl" TEXT,
  ADD COLUMN "compressedSize" INTEGER,
  ADD COLUMN "width" INTEGER,
  ADD COLUMN "height" INTEGER;
