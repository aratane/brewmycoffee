import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limited = rateLimit(`register:${clientIp(req.headers)}`, 5, 300_000);
  if (!limited.success) return NextResponse.json({ error: "Too many signup attempts. Please try again later." }, { status: 429 });

  const parsed = registerSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid details" }, { status: 400 });
  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  const role = await prisma.role.findUnique({ where: { name: "CUSTOMER" } });
  if (!role) return NextResponse.json({ error: "Registration is unavailable right now." }, { status: 500 });

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash: await bcrypt.hash(password, 12),
      roleId: role.id,
    },
  });
  const customer = await prisma.customer.create({
    data: { userId: user.id, name, email: user.email, phone },
  });
  await prisma.loyaltyPoint.create({ data: { customerId: customer.id, points: 0, lifetimePoints: 0, tier: "Bean" } });

  return NextResponse.json({ ok: true });
}
