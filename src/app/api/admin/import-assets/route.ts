import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { importPreparedCatalogAssets } from "@/lib/catalog-assets";

export const maxDuration = 60;

export async function POST(request: Request) {
  const token = request.headers.get("x-seed-token");
  if (!process.env.SEED_TOKEN || token !== process.env.SEED_TOKEN) {
    return NextResponse.json({ error: "invalid seed token" }, { status: 401 });
  }
  const prisma = new PrismaClient();
  try {
    const result = await importPreparedCatalogAssets({ prisma });
    return NextResponse.json({ ok: true, result });
  } finally {
    await prisma.$disconnect();
  }
}
