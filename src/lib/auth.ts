import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const cookieName = "moxi_session";

type SessionPayload = {
  userId: string;
  role: UserRole;
};

function secret() {
  return process.env.JWT_SECRET ?? "moxi-local-dev-secret-change-me";
}

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, secret(), { expiresIn: "14d" });
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(cookieName);
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, secret()) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login?next=/admin");
  }
  return user;
}

export async function requireApiAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("需要管理员登录");
  }
  return user;
}
