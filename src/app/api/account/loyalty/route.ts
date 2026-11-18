import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ points: 0 });
  const customer = await prisma.customer.findUnique({
    where: { userId: session.user.id },
    include: { loyalty: true },
  });
  return NextResponse.json({ points: customer?.loyalty?.points ?? 0, tier: customer?.loyalty?.tier ?? "Bean" });
}
