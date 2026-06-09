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
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "unknown error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
