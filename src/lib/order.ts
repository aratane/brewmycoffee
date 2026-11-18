import { prisma } from "@/lib/prisma";
import { generateCode, toNumber } from "@/lib/utils";
import { TAX_RATE, LOYALTY_POINTS_PER_IDR } from "@/lib/constants";

export function calculateTotals(input: {
  subtotal: number;
  discount?: number;
  deliveryFee?: number;
  taxEnabled?: boolean;
  serviceChargeRate?: number;
}) {
  const subtotal = Math.max(0, input.subtotal);
  const discount = Math.max(0, input.discount ?? 0);
  const afterDiscount = Math.max(0, subtotal - discount);
  const tax = input.taxEnabled === false ? 0 : Math.round(afterDiscount * TAX_RATE * 100) / 100;
  const serviceCharge = Math.round(afterDiscount * (input.serviceChargeRate ?? 0) * 100) / 100;
  const deliveryFee = Math.max(0, input.deliveryFee ?? 0);
  const total = Math.round((afterDiscount + tax + serviceCharge + deliveryFee) * 100) / 100;
  return {
    subtotal,
    discount,
    tax,
    serviceCharge,
    deliveryFee,
    total,
    loyaltyEarned: Math.floor(total * LOYALTY_POINTS_PER_IDR),
  };
}

/** Collision-safe order number, e.g. ABC-260118-X7K2QP */
export async function nextOrderNumber(prefix = "ABC") {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `${prefix}-${yy}${mm}${dd}-${generateCode("", 6)}`;
    const existing = await prisma.order.findUnique({ where: { orderNumber: candidate }, select: { id: true } });
    if (!existing) return candidate;
  }
  return `${prefix}-${yy}${mm}${dd}-${Date.now().toString(36).toUpperCase()}`;
}

export async function nextTransactionNumber() {
  return nextOrderNumber("TRX");
}

export async function applyVoucher(code: string, subtotal: number) {
  const voucher = await prisma.voucher.findUnique({ where: { code: code.toUpperCase() } });
  if (!voucher || !voucher.isActive) throw new Error("This voucher code is invalid or inactive.");
  if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) throw new Error("This voucher has expired.");
  if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) throw new Error("This voucher has been fully redeemed.");
  if (subtotal < toNumber(voucher.minOrder)) {
    throw new Error(`Minimum order for this voucher is Rp${toNumber(voucher.minOrder).toLocaleString("id-ID")}.`);
  }
  let discount = voucher.type === "PERCENT" ? (subtotal * toNumber(voucher.value)) / 100 : toNumber(voucher.value);
  if (voucher.maxDiscount) discount = Math.min(discount, toNumber(voucher.maxDiscount));
  return { voucher, discount: Math.min(discount, subtotal) };
}
