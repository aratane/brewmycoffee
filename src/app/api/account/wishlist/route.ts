import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ productId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const customer = await prisma.customer.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!customer) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const existing = await prisma.wishlistItem.findUnique({ where: { customerId_productId: { customerId: customer.id, productId: parsed.data.productId } } });
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }
  await prisma.wishlistItem.create({ data: { customerId: customer.id, productId: parsed.data.productId } });
  return NextResponse.json({ saved: true });
}
