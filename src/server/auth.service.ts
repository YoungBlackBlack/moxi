import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { signSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function registerOrLogin(input: {
  phone: string;
  password: string;
  displayName?: string;
  qq?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (existing) {
    const ok = await bcrypt.compare(input.password, existing.passwordHash);
    if (!ok) throw new Error("手机号或密码不正确");
    return { user: existing, token: signSession({ userId: existing.id, role: existing.role }) };
  }

  const role: UserRole = (await prisma.user.count()) === 0 ? "ADMIN" : "CUSTOMER";
  const user = await prisma.user.create({
    data: {
      phone: input.phone,
      qq: input.qq,
      displayName: input.displayName,
      role,
      passwordHash: await bcrypt.hash(input.password, 10)
    }
  });
  return { user, token: signSession({ userId: user.id, role }) };
}
