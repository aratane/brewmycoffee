import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const limited = rateLimit(`track:${clientIp(req.headers)}`, 30, 60_000);
  if (!limited.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const number = new URL(req.url).searchParams.get("number")?.trim().toUpperCase();
  if (!number) return NextResponse.json({ error: "Order number is required" }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { orderNumber: number },
    include: { items: true, table: { select: { number: true } }, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json({
    status: order.status,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName,
      notes: order.notes,
      type: order.type,
      createdAt: order.createdAt.toISOString(),
      table: order.table,
      items: order.items,
    },
    payment: order.payments[0] ? { status: order.payments[0].status, method: order.payments[0].method } : null,
  });
}
