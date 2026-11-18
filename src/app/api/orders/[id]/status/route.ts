import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can, PERMISSIONS } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { deductInventoryForOrder } from "@/lib/inventory";
import type { OrderStatus } from "@prisma/client";

const schema = z.object({ status: z.enum(["CONFIRMED", "PREPARING", "READY", "COMPLETED", "CANCELLED"]) });

const ALLOWED: Record<string, OrderStatus[]> = {
  PAID: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["COMPLETED", "CANCELLED"],
  PENDING_PAYMENT: ["CANCELLED"],
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const staff = can(session.user.role, PERMISSIONS.kitchen) || can(session.user.role, PERMISSIONS.usePos);
  const isOwner = order.userId === session.user.id;
  if (!staff && !(isOwner && parsed.data.status === "CANCELLED" && order.status === "PENDING_PAYMENT")) {
    return NextResponse.json({ error: "You cannot change this order's status" }, { status: 403 });
  }

  if (!ALLOWED[order.status]?.includes(parsed.data.status)) {
    return NextResponse.json({ error: `Cannot move from ${order.status} to ${parsed.data.status}` }, { status: 409 });
  }

  if (parsed.data.status === "COMPLETED") {
    // Deduct stock once, atomically with the status change.
    await prisma.$transaction(async (tx) => {
      await deductInventoryForOrder(order.id, tx);
      await tx.order.update({ where: { id }, data: { status: "COMPLETED" } });
    });
  } else {
    await prisma.order.update({ where: { id }, data: { status: parsed.data.status } });
  }

  await audit({ userId: session.user.id, action: "ORDER_STATUS", entity: "Order", entityId: id, before: { status: order.status }, after: { status: parsed.data.status } });
  return NextResponse.json({ ok: true, status: parsed.data.status });
}
