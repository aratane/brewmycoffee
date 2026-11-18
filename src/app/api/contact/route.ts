import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const limited = rateLimit(`contact:${clientIp(req.headers)}`, 3, 300_000);
  if (!limited.success) return NextResponse.json({ error: "Please wait a moment before sending another message." }, { status: 429 });

  const parsed = contactSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid message" }, { status: 400 });

  await prisma.auditLog.create({
    data: {
      action: "CONTACT_MESSAGE",
      entity: "Contact",
      entityId: parsed.data.email,
      after: parsed.data as never,
      ipAddress: clientIp(req.headers),
    },
  });
  return NextResponse.json({ ok: true });
}
