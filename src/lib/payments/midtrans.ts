import { createHash } from "node:crypto";

/**
 * Official Midtrans REST API client (server-side only).
 * Sandbox base: https://api.sandbox.midtrans.com
 * Production base: https://api.midtrans.com
 *
 * Never import this module into a client component — MIDTRANS_SERVER_KEY is secret.
 */

type MidtransConfig = {
  serverKey: string;
  clientKey?: string;
  isProduction: boolean;
};

function config(): MidtransConfig {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY is not configured.");
  return {
    serverKey,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  };
}

function baseUrl(c: MidtransConfig) {
  return c.isProduction ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";
}

function authHeader(c: MidtransConfig) {
  return `Basic ${Buffer.from(`${c.serverKey}:`).toString("base64")}`;
}

export function midtransSignatureKey(orderId: string, statusCode: string, grossAmount: string, serverKey?: string) {
  const key = serverKey ?? config().serverKey;
  return createHash("sha512").update(`${orderId}${statusCode}${grossAmount}${key}`).digest("hex");
}

/** Verifies the webhook signature exactly as prescribed by Midtrans. */
export function verifyMidtransWebhook(payload: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}) {
  const expected = midtransSignatureKey(
    payload.order_id,
    payload.status_code,
    payload.gross_amount
  );
  return expected === payload.signature_key;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const c = config();
  const res = await fetch(`${baseUrl(c)}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authHeader(c),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  const body = (await res.json()) as T & { error_messages?: string[] };
  if (!res.ok) {
    throw new Error(`Midtrans request failed (${res.status}): ${body.error_messages?.join(", ") ?? "unknown error"}`);
  }
  return body;
}

export type MidtransChargeResult = {
  transactionId: string;
  orderId: string;
  grossAmount: string;
  transactionStatus: string;
  qrisUrl?: string;
  vaNumber?: string;
  bank?: string;
  expiration?: string;
  raw: unknown;
};

/** Charge a QRIS payment. The returned `qrisUrl` is the official QR string from Midtrans. */
export async function chargeQris(input: {
  orderId: string;
  grossAmount: number;
  expiryMinutes?: number;
}): Promise<MidtransChargeResult> {
  const now = new Date();
  const expiryMinutes = input.expiryMinutes ?? 15;
  const body = {
    payment_type: "qris",
    transaction_details: { order_id: input.orderId, gross_amount: Math.round(input.grossAmount) },
    qris: { acquirer: "gopay" },
    expiry: {
      start_time: now.toISOString(),
      duration: expiryMinutes,
      unit: "minute",
    },
  };
  const result = await request<{
    transaction_id: string;
    order_id: string;
    gross_amount: string;
    transaction_status: string;
    actions?: Array<{ name: string; url: string }>;
    expiry_time?: string;
  }>("/v2/charge", { method: "POST", body: JSON.stringify(body) });

  const qrisUrl = result.actions?.find((a) => a.name === "qr_pay")?.url;
  if (!qrisUrl) throw new Error("Midtrans did not return a QRIS QR string.");
  return {
    transactionId: result.transaction_id,
    orderId: result.order_id,
    grossAmount: result.gross_amount,
    transactionStatus: result.transaction_status,
    qrisUrl,
    expiration: result.expiry_time,
    raw: result,
  };
}

/** Charge a bank virtual account. */
export async function chargeBankTransfer(input: {
  orderId: string;
  grossAmount: number;
  bank: string;
  vaNumber?: string;
  expiryMinutes?: number;
}): Promise<MidtransChargeResult> {
  const now = new Date();
  const body = {
    payment_type: "bank_transfer",
    transaction_details: { order_id: input.orderId, gross_amount: Math.round(input.grossAmount) },
    bank_transfer: {
      bank: input.bank.toLowerCase(),
      ...(input.vaNumber ? { va_number: input.vaNumber } : {}),
    },
    expiry: {
      start_time: now.toISOString(),
      duration: input.expiryMinutes ?? 1440,
      unit: "minute",
    },
  };
  const result = await request<{
    transaction_id: string;
    order_id: string;
    gross_amount: string;
    transaction_status: string;
    va_numbers?: Array<{ bank: string; va_number: string }>;
    expiry_time?: string;
  }>("/v2/charge", { method: "POST", body: JSON.stringify(body) });

  const va = result.va_numbers?.[0];
  if (!va) throw new Error("Midtrans did not return a virtual account number.");
  return {
    transactionId: result.transaction_id,
    orderId: result.order_id,
    grossAmount: result.gross_amount,
    transactionStatus: result.transaction_status,
    vaNumber: va.va_number,
    bank: va.bank,
    expiration: result.expiry_time,
    raw: result,
  };
}

/** Query the exact status of a transaction from Midtrans (used by reconciliation). */
export async function getMidtransStatus(orderId: string) {
  return request<Record<string, unknown>>(`/v2/${encodeURIComponent(orderId)}/status`, { method: "GET" });
}
