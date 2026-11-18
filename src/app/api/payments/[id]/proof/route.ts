import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Uploads a manual-transfer proof. NEVER marks the payment as paid — admin verifies it. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const limited = rateLimit(`proof:${clientIp(req.headers)}`, 8, 300_000);
  if (!limited.success) return NextResponse.json({ error: "Too many uploads. Please wait." }, { status: 429 });

  const payment = await prisma.payment.findUnique({ where: { id }, select: { id: true, method: true, status: true } });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  if (payment.method !== "BANK_TRANSFER") return NextResponse.json({ error: "Proof is only for bank transfers" }, { status: 400 });
  if (payment.status === "PAID" || payment.status === "VERIFIED") return NextResponse.json({ error: "This payment is already verified" }, { status: 409 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("proof");
  if (!(file instanceof File)) return NextResponse.json({ error: "Please choose a payment proof image" }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Only JPG, PNG, or WEBP images are allowed" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Proof must be under 5 MB" }, { status: 400 });

  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const name = `proof-${id}-${Date.now()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, name), Buffer.from(await file.arrayBuffer()));

  await prisma.payment.update({
    where: { id },
    data: { proofUrl: `/uploads/${name}`, status: "PENDING", metadata: { proofUploadedAt: new Date().toISOString() } },
  });

  return NextResponse.json({ ok: true, proofUrl: `/uploads/${name}` });
}
