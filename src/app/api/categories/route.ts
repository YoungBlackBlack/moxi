import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { enabled: true },
    orderBy: [{ mode: "asc" }, { sortOrder: "asc" }]
  });
  return NextResponse.json({ categories });
}
