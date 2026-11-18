import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  const limited = rateLimit(`review:${session?.user?.id ?? clientIp(req.headers)}`, 5, 300_000);
  if (!limited.success) return NextResponse.json({ error: "Too many reviews. Slow down a little!" }, { status: 429 });

  const parsed = reviewSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid review" }, { status: 400 });

  const customer = session?.user?.id
    ? await prisma.customer.findUnique({ where: { userId: session.user.id }, select: { id: true } })
    : null;

  const review = await prisma.review.create({
    data: {
      productId: parsed.data.productId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      customerId: customer?.id,
      isApproved: false,
    },
  });
  return NextResponse.json({ id: review.id });
}
