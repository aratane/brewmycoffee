import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can, PERMISSIONS } from "@/lib/rbac";
import { calculateTotals, nextOrderNumber, nextTransactionNumber } from "@/lib/order";
import { initializePayment } from "@/lib/payments";
import { deductInventoryForOrder } from "@/lib/inventory";
import { audit } from "@/lib/audit";
import { toNumber } from "@/lib/utils";
import type { ProductSize, Temperature } from "@prisma/client";

const schema = z.object({
  items: z.array(z.object({
    productId: z.string(), quantity: z.number().int().min(1).max(99),
    size: z.enum(["SMALL", "MEDIUM", "LARGE"]), temperature: z.enum(["HOT", "ICED"]),
    sugarLevel: z.number().int(), iceLevel: z.number().int(),
    extraShot: z.boolean(), extraMilk: z.boolean(), addons: z.array(z.string()),
  })).min(1),
  customerName: z.string().min(2).max(100),
  orderType: z.enum(["DINE_IN", "TAKEAWAY"]),
  tableNumber: z.string().optional(),
  discount: z.number().min(0).default(0),
  serviceChargeRate: z.number().min(0).max(0.2).default(0),
  taxEnabled: z.boolean().default(true),
  paymentMethod: z.enum(["CASH", "QRIS", "BANK_TRANSFER"]),
  amountTendered: z.number().min(0).optional(),
  bank: z.string().optional(),
});

const SIZE_ADJUST: Record<ProductSize, number> = { SMALL: -4000, MEDIUM: 0, LARGE: 6000 };

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, PERMISSIONS.usePos)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const employee = await prisma.employee.findUnique({ where: { userId: session.user.id }, select: { id: true } });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid sale" }, { status: 400 });
  const input = parsed.data;

  const ids = [...new Set(input.items.map((i) => i.productId))];
  const dbProducts = await prisma.product.findMany({ where: { id: { in: ids } }, include: { addons: true } });
  const byId = new Map(dbProducts.map((p) => [p.id, p]));
  if (byId.size !== ids.length) return NextResponse.json({ error: "A product is no longer available" }, { status: 409 });

  const priced = input.items.map((i) => {
    const p = byId.get(i.productId)!;
    const addonTotal = i.addons.reduce((sum, name) => sum + (p.addons.find((a) => a.name === name) ? toNumber(p.addons.find((a) => a.name === name)!.price) : 0), 0);
    const unit = Math.max(1000, toNumber(p.price) + SIZE_ADJUST[i.size] + (i.extraShot ? 8000 : 0) + (i.extraMilk ? 5000 : 0) + addonTotal);
    return { ...i, nameSnapshot: p.name, unitPrice: unit, lineTotal: unit * i.quantity };
  });

  const subtotal = priced.reduce((s, i) => s + i.lineTotal, 0);
  const totals = calculateTotals({
    subtotal, discount: Math.min(input.discount, subtotal),
    taxEnabled: input.taxEnabled, serviceChargeRate: input.serviceChargeRate,
  });

  if (input.paymentMethod === "CASH" && (input.amountTendered ?? 0) < totals.total) {
    return NextResponse.json({ error: "Insufficient cash tendered" }, { status: 400 });
  }

  const table = input.tableNumber ? await prisma.table.findUnique({ where: { number: input.tableNumber }, select: { id: true } }) : null;
  const orderNumber = await nextOrderNumber();
  const isCash = input.paymentMethod === "CASH";
  const order = await prisma.order.create({
    data: {
      orderNumber, source: "POS", type: input.orderType,
      status: isCash ? "COMPLETED" : "PENDING_PAYMENT",
      tableId: table?.id, customerName: input.customerName,
      subtotal: totals.subtotal, discount: totals.discount, tax: totals.tax,
      serviceCharge: totals.serviceCharge, total: totals.total,
      loyaltyEarned: 0,
      items: { create: priced.map((i) => ({
        productId: i.productId, nameSnapshot: i.nameSnapshot, unitPrice: i.unitPrice, quantity: i.quantity,
        size: i.size as ProductSize, temperature: i.temperature as Temperature,
        sugarLevel: i.sugarLevel, iceLevel: i.iceLevel, extraShot: i.extraShot, extraMilk: i.extraMilk,
        addons: i.addons, lineTotal: i.lineTotal,
      })) },
      payments: { create: {
        method: input.paymentMethod, status: isCash ? "PAID" : "PENDING", amount: totals.total,
        paidAt: isCash ? new Date() : null, bank: input.bank?.toUpperCase(),
      } },
    },
    include: { items: true, payments: true },
  });

  const transactionNumber = await nextTransactionNumber();
  const change = isCash ? Math.max(0, (input.amountTendered ?? 0) - totals.total) : 0;
  const transaction = await prisma.transaction.create({
    data: {
      transactionNumber, orderId: order.id, cashierId: employee?.id,
      type: "POS", subtotal: totals.subtotal, discount: totals.discount, tax: totals.tax,
      serviceCharge: totals.serviceCharge, total: totals.total,
      amountTendered: isCash ? input.amountTendered : null, change,
      paymentMethod: input.paymentMethod, paymentStatus: isCash ? "PAID" : "PENDING",
      status: isCash ? "COMPLETED" : "PENDING",
      receiptData: {
        transactionNumber, cashier: session.user.name, date: new Date().toISOString(),
        customerName: input.customerName, orderType: input.orderType,
        tableNumber: input.tableNumber,
        items: priced.map((i) => ({ name: i.nameSnapshot, quantity: i.quantity, unitPrice: i.unitPrice, lineTotal: i.lineTotal, size: i.size })),
        subtotal: totals.subtotal, discount: totals.discount, tax: totals.tax, serviceCharge: totals.serviceCharge,
        total: totals.total, paymentMethod: input.paymentMethod, amountTendered: isCash ? input.amountTendered : null,
        change, status: isCash ? "COMPLETED" : "PENDING",
      },
    },
  });

  if (isCash) {
    await prisma.$transaction(async (tx) => {
      await deductInventoryForOrder(order.id, tx);
      await tx.table.updateMany({ where: { number: input.tableNumber ?? "__none__" }, data: { status: "OCCUPIED" } });
    });
  }

  let paymentInfo: Awaited<ReturnType<typeof initializePayment>> | null = null;
  if (input.paymentMethod !== "CASH") {
    try {
      paymentInfo = await initializePayment({
        paymentId: order.payments[0].id, orderId: order.id, orderNumber, method: input.paymentMethod,
        amount: totals.total, bank: input.bank,
      });
    } catch (error) {
      await prisma.payment.update({ where: { id: order.payments[0].id }, data: { metadata: { error: error instanceof Error ? error.message : "Gateway error" } } });
    }
  }

  await audit({ userId: session.user.id, action: "POS_TRANSACTION", entity: "Transaction", entityId: transaction.id, after: { total: totals.total, method: input.paymentMethod } });

  return NextResponse.json({
    ok: true, orderNumber, transactionNumber,
    total: totals.total, change,
    receipt: transaction.receiptData,
    payment: paymentInfo,
    completed: isCash,
  });
}
