import { auth } from "@clerk/nextjs/server";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true, deletedAt: true },
  });
  if (!user || user.deletedAt || user.role !== "ADMIN") throw new ForbiddenError();
  return user;
}
