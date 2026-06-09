import { NextResponse } from "next/server";
import { confirmFileSchema } from "@/lib/validation";
import { orderService } from "@/server/order.service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = confirmFileSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const file = await orderService.addFile(id, payload.data);
  return NextResponse.json({ file }, { status: 201 });
}
