import { NextResponse } from "next/server";
import { seedDatabase } from "../../../../../prisma/seed";

export const maxDuration = 60;

export async function POST(request: Request) {
  const token = request.headers.get("x-seed-token");
  if (!process.env.SEED_TOKEN || token !== process.env.SEED_TOKEN) {
    return NextResponse.json({ error: "invalid seed token" }, { status: 401 });
  }
  const result = await seedDatabase();
  return NextResponse.json({ ok: true, result });
}
