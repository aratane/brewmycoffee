import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { applyPaymentNotification } from "@/lib/payments";
import { verifyMidtransWebhook } from "@/lib/payments/midtrans";
import { clientIp } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

/**
 * POST /api/payments/webhook
 * Midtrans sends JSON here. We verify the SHA512 signature before touching state,
 * and applyPaymentNotification is idempotent via the unique event id.
 */
export async function POST(req: Request) {
  const rawText = await req.text();
  let payload: Record<string, string>;
  try {
    payload = JSON.parse(rawText) as Record<string, string>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!process.env.MIDTRANS_SERVER_KEY) {
    return NextResponse.json({ error: "Payment gateway is not configured on this server." }, { status: 503 });
  }

  const secret = process.env.MIDTRANS_WEBHOOK_SECRET;
  // Optional extra layer: Midtrans lets you set a custom header/body key.
  if (secret && payload.webhook_secret !== secret) {
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
  }

  const signatureValid = verifyMidtransWebhook({
    order_id: payload.order_id ?? "",
    status_code: payload.status_code ?? "",
    gross_amount: payload.gross_amount ?? "",
    signature_key: payload.signature_key ?? "",
  });

  const eventId = payload.transaction_id || createHash("sha256").update(rawText).digest("hex");

  if (!signatureValid) {
    await prisma.paymentWebhook.upsert({
      where: { eventId },
      update: {},
      create: { gateway: "midtrans", eventId, eventType: payload.transaction_status, payload: payload as never, signatureValid: false },
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({ where: { orderNumber: payload.order_id }, select: { id: true } });
  if (!order) return NextResponse.json({ error: "Unknown order" }, { status: 404 });

  const result = await applyPaymentNotification({
    orderId: order.id,
    transactionStatus: payload.transaction_status ?? "",
    fraudStatus: payload.fraud_status,
    grossAmount: payload.gross_amount ?? "0",
    eventId,
    raw: payload,
  });

  await audit({ action: "PAYMENT_WEBHOOK", entity: "Payment", entityId: payload.order_id, after: { ...result, status: payload.transaction_status }, ipAddress: clientIp(req.headers) });

  return NextResponse.json({ ok: true, ...result });
}
