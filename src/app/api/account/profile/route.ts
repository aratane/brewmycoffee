import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ name: z.string().min(2).max(80), phone: z.string().max(20).optional() });

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid details" }, { status: 400 });

  await prisma.$transaction([
    prisma.user.update({ where: { id: session.user.id }, data: { name: parsed.data.name, phone: parsed.data.phone } }),
    prisma.customer.updateMany({ where: { userId: session.user.id }, data: { name: parsed.data.name, phone: parsed.data.phone } }),
  ]);
  return NextResponse.json({ ok: true });
}
