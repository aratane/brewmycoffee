import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validations";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limited = rateLimit(`newsletter:${clientIp(req.headers)}`, 5, 60_000);
  if (!limited.success) return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });

  const parsed = newsletterSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });

  await prisma.newsletterSubscriber.upsert({ where: { email: parsed.data.email }, update: {}, create: { email: parsed.data.email } });
  return NextResponse.json({ ok: true });
}
