import { NextResponse } from "next/server";
import { applyVoucher } from "@/lib/order";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const limited = rateLimit(`voucher:${clientIp(req.headers)}`, 20, 60_000);
  if (!limited.success) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim().toUpperCase();
  const subtotal = Number(searchParams.get("subtotal") ?? 0);
  if (!code || !Number.isFinite(subtotal)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    const { discount } = await applyVoucher(code, subtotal);
    return NextResponse.json({ discount, code });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid voucher" }, { status: 400 });
  }
}
