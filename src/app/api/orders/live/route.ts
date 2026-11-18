import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can, PERMISSIONS } from "@/lib/rbac";

/** Kitchen feed. Auth is enforced server-side — never public. */
export async function GET() {
  const session = await auth();
  if (!session?.user || !can(session.user.role, PERMISSIONS.kitchen)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await prisma.order.findMany({
    where: { status: { in: ["PAID", "CONFIRMED", "PREPARING", "READY"] } },
    orderBy: { createdAt: "asc" },
    take: 60,
    include: {
      items: true,
      table: { select: { number: true } },
    },
  });
  return NextResponse.json({
    orders: orders.map((o) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
      items: o.items.map((i) => ({ ...i, createdAt: i.createdAt.toISOString(), addons: i.addons })),
    })),
  });
}
