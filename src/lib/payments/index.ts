import { chargeBankTransfer, chargeQris, type MidtransChargeResult } from "@/lib/payments/midtrans";
import { prisma } from "@/lib/prisma";
import { BANKS } from "@/lib/constants";
import { toNumber } from "@/lib/utils";

export type PaymentMode = "sandbox" | "live" | "disabled";

export function paymentMode(): PaymentMode {
  const mode = process.env.PAYMENT_MODE ?? "disabled";
  if (mode === "sandbox" || mode === "live") return mode;
  return "disabled";
}

export function gatewayConfigured() {
  return Boolean(process.env.MIDTRANS_SERVER_KEY);
}

async function storeSetting(key: string, fallback: string) {
  const row = await prisma.storeSetting.findUnique({ where: { key } });
  if (!row) return fallback;
  const value = row.value as { value?: string };
  return value?.value ?? fallback;
}

export type PaymentInitResult =
  | {
      kind: "gateway";
      paymentId: string;
      qrString?: string;
      vaNumber?: string;
      bank?: string;
      expiredAt?: Date;
      clientKey?: string;
      mode: PaymentMode;
    }
  | {
      kind: "manual";
      paymentId: string;
      bank: string;
      accountNumber: string;
      accountName: string;
      amount: number;
      instructions: string[];
      mode: "manual";
    }
  | { kind: "unconfigured"; paymentId: string; message: string };

/**
 * Initializes a payment for an existing PENDING_PAYMENT order.
 * QRIS is NEVER fabricated: when the gateway is unavailable we return an explicit
 * `unconfigured` result and show setup instructions instead of a fake QR code.
 */
export async function initializePayment(input: {
  paymentId: string;
  orderId: string;
  orderNumber: string;
  method: "QRIS" | "BANK_TRANSFER";
  amount: number;
  bank?: string;
}): Promise<PaymentInitResult> {
  const mode = paymentMode();

  if (input.method === "BANK_TRANSFER" && !gatewayConfigured()) {
    // Manual/static bank transfer is a real, verifiable offline flow.
    const bankCode = input.bank ?? "bca";
    const bank = BANKS.find((b) => b.code === bankCode) ?? BANKS[0];
    const accountNumber = await storeSetting(`bank_account_${bank.code}`, "8808123456789");
    const accountName = await storeSetting("bank_account_name", "ARTISAN BREW CO.");
    await prisma.payment.update({
      where: { id: input.paymentId },
      data: {
        bank: bank.name,
        vaNumber: accountNumber,
        metadata: { mode: "manual", bank: bank.name, accountNumber, accountName },
      },
    });
    return {
      kind: "manual",
      paymentId: input.paymentId,
      bank: bank.name,
      accountNumber,
      accountName,
      amount: input.amount,
      instructions: [
        `Transfer exactly Rp${input.amount.toLocaleString("id-ID")} to ${bank.name}.`,
        `Account number: ${accountNumber} a.n. ${accountName}.`,
        "Upload your transfer proof on this page.",
        "Our team verifies manual transfers manually — the order will not be marked paid automatically.",
      ],
      mode: "manual",
    };
  }

  if (!gatewayConfigured()) {
    await prisma.payment.update({
      where: { id: input.paymentId },
      data: { metadata: { mode: "unconfigured", reason: "MIDTRANS_SERVER_KEY missing" } },
    });
    return {
      kind: "unconfigured",
      paymentId: input.paymentId,
      message:
        "QRIS payment gateway is not configured yet. Set PAYMENT_MODE=sandbox and add MIDTRANS_SERVER_KEY / MIDTRANS_CLIENT_KEY to .env to enable real QRIS charges.",
    };
  }

  let charge: MidtransChargeResult;
  if (input.method === "QRIS") {
    charge = await chargeQris({ orderId: input.orderNumber, grossAmount: input.amount });
  } else {
    charge = await chargeBankTransfer({
      orderId: input.orderNumber,
      grossAmount: input.amount,
      bank: input.bank ?? "bca",
    });
  }

  const expiredAt = charge.expiration ? new Date(charge.expiration) : undefined;
  await prisma.payment.update({
    where: { id: input.paymentId },
    data: {
      gateway: "midtrans",
      gatewayOrderId: charge.orderId,
      gatewayTransactionId: charge.transactionId,
      qrisString: charge.qrisUrl,
      vaNumber: charge.vaNumber,
      bank: charge.bank?.toUpperCase() ?? input.bank?.toUpperCase(),
      expirationAt: expiredAt,
      metadata: { mode, rawStatus: charge.transactionStatus },
    },
  });

  return {
    kind: "gateway",
    paymentId: input.paymentId,
    qrString: charge.qrisUrl,
    vaNumber: charge.vaNumber,
    bank: charge.bank?.toUpperCase(),
    expiredAt,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
    mode,
  };
}

const SETTLEMENT_STATUSES = new Set(["settlement", "capture"]);
const FAILURE_STATUSES = new Set(["expire", "cancel", "deny"]);

/** Idempotent webhook application. Safe to call repeatedly for the same event. */
export async function applyPaymentNotification(input: {
  orderId: string;
  transactionStatus: string;
  fraudStatus?: string;
  grossAmount: string;
  eventId: string;
  raw: unknown;
}) {
  return prisma.$transaction(async (tx) => {
    const existingEvent = await tx.paymentWebhook.findUnique({ where: { eventId: input.eventId } });
    if (existingEvent) return { applied: false, reason: "duplicate-event" };

    const order = await tx.order.findUnique({
      where: { id: input.orderId },
      include: { payments: { orderBy: { createdAt: "desc" } }, items: true },
    });
    if (!order) return { applied: false, reason: "order-not-found" };

    const payment = order.payments[0];
    if (!payment) return { applied: false, reason: "payment-not-found" };
    if (payment.status === "PAID" || payment.status === "VERIFIED") {
      await tx.paymentWebhook.create({
        data: {
          gateway: "midtrans",
          eventId: input.eventId,
          payload: input.raw as never,
          signatureValid: true,
          processedAt: new Date(),
        },
      });
      return { applied: false, reason: "already-paid" };
    }

    const status = input.transactionStatus.toLowerCase();
    let nextPaymentStatus: "PAID" | "EXPIRED" | "FAILED" | null = null;
    if (SETTLEMENT_STATUSES.has(status) && input.fraudStatus !== "challenge") nextPaymentStatus = "PAID";
    else if (status === "expire") nextPaymentStatus = "EXPIRED";
    else if (FAILURE_STATUSES.has(status)) nextPaymentStatus = "FAILED";

    await tx.paymentWebhook.create({
      data: {
        paymentId: payment.id,
        gateway: "midtrans",
        eventId: input.eventId,
        eventType: status,
        payload: input.raw as never,
        signatureValid: true,
        processedAt: new Date(),
      },
    });

    if (nextPaymentStatus === "PAID") {
      // Re-check amount to prevent underpayment fraud.
      if (Math.abs(Number(input.grossAmount) - toNumber(order.total)) > 1) {
        return { applied: false, reason: "amount-mismatch" };
      }
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "PAID", paidAt: new Date(), gatewayTransactionId: payment.gatewayTransactionId },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: "CONFIRMED" },
      });
      // Online orders share the same transaction table as POS sales.
      await tx.transaction.upsert({
        where: { orderId: order.id },
        create: {
          transactionNumber: `TRX-${order.orderNumber.split("-").pop()}`,
          orderId: order.id,
          type: "ONLINE",
          subtotal: order.subtotal,
          discount: order.discount,
          tax: order.tax,
          serviceCharge: order.serviceCharge,
          total: order.total,
          paymentMethod: payment.method,
          paymentStatus: "PAID",
          status: "COMPLETED",
        },
        update: {},
      });
      const { deductInventoryForOrder } = await import("@/lib/inventory");
      await deductInventoryForOrder(order.id, tx);
      return { applied: true, status: "PAID" };
    }

    if (nextPaymentStatus) {
      await tx.payment.update({ where: { id: payment.id }, data: { status: nextPaymentStatus } });
      await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      return { applied: true, status: nextPaymentStatus };
    }

    return { applied: false, reason: "intermediate-status" };
  });
}
