import { NextResponse } from "next/server";
import { quoteRequestSchema } from "@/lib/validation";
import { quoteService } from "@/server/quote.service";

export async function POST(request: Request) {
  const payload = quoteRequestSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }
  const quote = await quoteService.calculate(payload.data);
  return NextResponse.json(quote);
}
