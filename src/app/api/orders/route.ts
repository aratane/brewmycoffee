import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateTotals, nextOrderNumber, applyVoucher } from "@/lib/order";
import { initializePayment } from "@/lib/payments";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { toNumber } from "@/lib/utils";
import type { ProductSize, Temperature } from "@prisma/client";

const payloadSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).max(99),
    size: z.enum(["SMALL", "MEDIUM", "LARGE"]).default("MEDIUM"),
    temperature: z.enum(["HOT", "ICED"]).default("HOT"),
    sugarLevel: z.number().int().min(0).max(200).default(100),
    iceLevel: z.number().int().min(0).max(200).default(100),
    extraShot: z.boolean().default(false),
    extraMilk: z.boolean().default(false),
    addons: z.array(z.string()).default([]),
    note: z.string().max(200).optional(),
  })).min(1).max(50),
  customerName: z.string().min(2).max(100),
  customerPhone: z.string().min(8).max(20),
  customerEmail: z.union([z.string().email(), z.literal("")]).optional(),
  type: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]),
  tableNumber: z.string().optional(),
  notes: z.string().max(500).optional(),
  paymentMethod: z.enum(["QRIS", "BANK_TRANSFER", "CASH"]),
  bank: z.string().optional(),
  voucherCode: z.string().optional(),
  useLoyalty: z.boolean().optional(),
});

const SIZE_ADJUST: Record<ProductSize, number> = { SMALL: -4000, MEDIUM: 0, LARGE: 6000 };

export async function POST(req: Request) {
  const limited = rateLimit(`checkout:${clientIp(req.headers)}`, 8, 60_000);
  if (!limited.success) return NextResponse.json({ error: "Too many checkout attempts. Please wait a moment." }, { status: 429 });

  const parsed = payloadSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid order" }, { status: 400 });
  const input = parsed.data;

  const session = await auth();
  const customer = session?.user?.id
    ? await prisma.customer.findUnique({ where: { userId: session.user.id }, include: { loyalty: true } })
    : null;

  // Always re-price on the server from the database — client prices are untrusted.
  const productIds = [...new Set(input.items.map((i) => i.productId))];
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: productIds }, isAvailable: true },
    include: { addons: true },
  });
  const byId = new Map(dbProducts.map((p) => [p.id, p]));
  if (byId.size !== productIds.length) {
    return NextResponse.json({ error: "One of your items is no longer available. Please review your basket." }, { status: 409 });
  }

  const pricedItems = input.items.map((item) => {
    const product = byId.get(item.productId)!;
    const addonTotal = item.addons.reduce((sum, name) => {
      const addon = product.addons.find((a) => a.name === name);
      return sum + (addon ? toNumber(addon.price) : 0);
    }, 0);
    const unitPrice = Math.max(1000, toNumber(product.price) + SIZE_ADJUST[item.size] + (item.extraShot ? 8000 : 0) + (item.extraMilk ? 5000 : 0) + addonTotal);
    return { ...item, nameSnapshot: product.name, productId: product.id, unitPrice, lineTotal: unitPrice * item.quantity };
  });

  const subtotal = pricedItems.reduce((sum, i) => sum + i.lineTotal, 0);
  let discount = 0;
  if (input.voucherCode) {
    try {
      const applied = await applyVoucher(input.voucherCode, subtotal);
      discount = applied.discount;
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid voucher" }, { status: 400 });
    }
  }

  let loyaltyUsed = 0;
  if (input.useLoyalty && customer?.loyalty && customer.loyalty.points >= 100) {
    loyaltyUsed = Math.min(customer.loyalty.points, Math.floor((subtotal - discount) / 1000));
    discount += loyaltyUsed * 1000;
  }

  const totals = calculateTotals({
    subtotal,
    discount,
    deliveryFee: input.type === "DELIVERY" ? 10000 : 0,
  });

  const table = input.tableNumber
    ? await prisma.table.findUnique({ where: { number: input.tableNumber }, select: { id: true } })
    : null;

  const orderNumber = await nextOrderNumber();
  const order = await prisma.order.create({
    data: {
      orderNumber,
      source: "ONLINE",
      type: input.type,
      status: "PENDING_PAYMENT",
      customerId: customer?.id,
      userId: session?.user?.id,
      tableId: table?.id,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail || null,
      notes: input.notes,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
      voucherCode: input.voucherCode?.toUpperCase(),
      loyaltyUsed,
      loyaltyEarned: totals.loyaltyEarned,
      items: {
        create: pricedItems.map((i) => ({
          productId: i.productId,
          nameSnapshot: i.nameSnapshot,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          size: i.size as ProductSize,
          temperature: i.temperature as Temperature,
          sugarLevel: i.sugarLevel,
          iceLevel: i.iceLevel,
          extraShot: i.extraShot,
          extraMilk: i.extraMilk,
          addons: i.addons,
          note: i.note,
          lineTotal: i.lineTotal,
        })),
      },
    },
  });

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      method: input.paymentMethod === "CASH" ? "CASH" : input.paymentMethod,
      status: "PENDING",
      amount: totals.total,
      bank: input.bank?.toUpperCase(),
    },
  });

  let paymentInfo: Awaited<ReturnType<typeof initializePayment>>;
  if (input.paymentMethod === "CASH") {
    await prisma.payment.update({ where: { id: payment.id }, data: { metadata: { mode: "cash", note: "Pay at counter" } } });
    paymentInfo = { kind: "manual", paymentId: payment.id, bank: "Pay at counter", accountNumber: "", accountName: "Artisan Brew Co.", amount: totals.total, instructions: ["Show your order number at the counter.", "Payment is confirmed by our cashier."], mode: "manual" };
  } else {
    try {
      paymentInfo = await initializePayment({
        paymentId: payment.id,
        orderId: order.id,
        orderNumber,
        method: input.paymentMethod,
        amount: totals.total,
        bank: input.bank,
      });
    } catch (error) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", metadata: { error: error instanceof Error ? error.message : "Gateway error" } },
      });
      return NextResponse.json({ error: `Payment could not be initialized: ${error instanceof Error ? error.message : "unknown error"}. Your order #${orderNumber} was saved — please contact us.` }, { status: 502 });
    }
  }

  if (input.voucherCode) {
    await prisma.voucher.update({ where: { code: input.voucherCode.toUpperCase() }, data: { usedCount: { increment: 1 } } });
  }

  return NextResponse.json({
    orderNumber,
    total: totals.total,
    payment: paymentInfo,
  });
}
