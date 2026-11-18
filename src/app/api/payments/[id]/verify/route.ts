import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can, PERMISSIONS } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { deductInventoryForOrder } from "@/lib/inventory";

const schema = z.object({ action: z.enum(["VERIFY", "REJECT"]), reason: z.string().max(300).optional() });

/** Manual bank-transfer verification. Never automatic. Admin only. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || !can(session.user.role, PERMISSIONS.verifyPayments)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const payment = await prisma.payment.findUnique({ where: { id }, include: { order: true } });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  if (!["BANK_TRANSFER", "CASH"].includes(payment.method)) return NextResponse.json({ error: "Only manual payments can be verified here" }, { status: 400 });
  if (payment.status === "PAID" || payment.status === "VERIFIED") return NextResponse.json({ error: "Already verified" }, { status: 409 });
  if (payment.method === "BANK_TRANSFER" && !payment.proofUrl && parsed.data.action === "VERIFY") {
    return NextResponse.json({ error: "No proof has been uploaded yet" }, { status: 400 });
  }

  if (parsed.data.action === "VERIFY") {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({ where: { id }, data: { status: "VERIFIED", paidAt: new Date(), verifiedById: session.user.id, verifiedAt: new Date() } });
      await tx.order.update({ where: { id: payment.orderId }, data: { status: "CONFIRMED" } });
      await tx.transaction.upsert({
        where: { orderId: payment.orderId },
        create: {
          transactionNumber: `TRX-${payment.order.orderNumber.split("-").pop()}`,
          orderId: payment.orderId,
          type: "ONLINE",
          subtotal: payment.order.subtotal,
          discount: payment.order.discount,
          tax: payment.order.tax,
          serviceCharge: payment.order.serviceCharge,
          total: payment.order.total,
          paymentMethod: payment.method,
          paymentStatus: "VERIFIED",
          status: "COMPLETED",
        },
        update: {},
      });
      await deductInventoryForOrder(payment.orderId, tx);
    });
  } else {
    await prisma.payment.update({ where: { id }, data: { status: "REJECTED", verifiedById: session.user.id, verifiedAt: new Date(), rejectionReason: parsed.data.reason } });
    await prisma.order.update({ where: { id: payment.orderId }, data: { status: "CANCELLED" } });
  }

  await audit({ userId: session.user.id, action: `PAYMENT_${parsed.data.action}`, entity: "Payment", entityId: id });
  return NextResponse.json({ ok: true, status: parsed.data.action });
}
