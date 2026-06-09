import { NextResponse } from "next/server";
import { authSchema } from "@/lib/validation";
import { setSessionCookie } from "@/lib/auth";
import { registerOrLogin } from "@/server/auth.service";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const raw =
    contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
  const payload = authSchema.safeParse(raw);
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  try {
    const { user, token } = await registerOrLogin(payload.data);
    await setSessionCookie(token);
    if (!contentType.includes("application/json")) {
      const next = new URL(request.url).searchParams.get("next");
      return NextResponse.redirect(new URL(next || (user.role === "ADMIN" ? "/admin" : "/order"), request.url), 303);
    }
    return NextResponse.json({ user: { id: user.id, phone: user.phone, role: user.role } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "unknown error" }, { status: 400 });
  }
}
