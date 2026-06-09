import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createOrderSchema } from "@/lib/validation";
import { orderService } from "@/server/order.service";

export async function GET() {
  return NextResponse.json({ message: "Use POST /api/orders to create an order." });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const raw =
    contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
  const payload = createOrderSchema.safeParse({
    ...raw,
    craftOptions: typeof raw.craftOptions === "object" && raw.craftOptions !== null ? raw.craftOptions : {}
  });

  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const user = await getCurrentUser();
  const order = await orderService.create({ ...payload.data, userId: user?.id });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/orders/${order.id}`, request.url), 303);
  }

  return NextResponse.json({ order }, { status: 201 });
}
