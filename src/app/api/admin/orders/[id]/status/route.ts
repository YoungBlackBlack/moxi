import { NextResponse } from "next/server";
import { adminStatusSchema } from "@/lib/validation";
import { orderService } from "@/server/order.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = adminStatusSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  try {
    const order = await orderService.updateStatus(id, payload.data.status, payload.data.note);
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "unknown error" }, { status: 400 });
  }
}
