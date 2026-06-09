import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { shipmentSchema } from "@/lib/validation";
import { orderService } from "@/server/order.service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireApiAdmin();
  const { id } = await params;
  const raw = Object.fromEntries((await request.formData()).entries());
  const payload = shipmentSchema.safeParse(raw);
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }
  await orderService.addShipment(id, payload.data.carrier, payload.data.trackingNo);
  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
