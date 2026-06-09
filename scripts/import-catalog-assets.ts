import { PrismaClient } from "@prisma/client";
import { importPreparedCatalogAssets } from "@/lib/catalog-assets";

async function main() {
  const prisma = new PrismaClient();
  try {
    const result = await importPreparedCatalogAssets({ prisma });
    console.log(`Imported ${result.uploaded}/${result.total} catalog assets into ${result.bucket}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
