import Link from "next/link";
import { notFound } from "next/navigation";
import { Frown, ArrowRight, RefreshCw } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function FailedPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({ where: { orderNumber: orderNumber.toUpperCase() }, select: { orderNumber: true, status: true } });
  if (!order) notFound();

  return (
    <div className="container-artisan flex min-h-[70vh] flex-col items-center justify-center py-12 text-center">
      <span className="text-8xl">🐰💭</span>
      <h1 className="heading-lg mt-7">Hmm, that payment didn't go through.</h1>
      <p className="mt-3 max-w-md text-muted">No worries — even our best baristas have an off shot sometimes. Your order {order.orderNumber} is still saved. You can try again with a fresh order.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/menu"><Button size="lg"><RefreshCw className="h-4 w-4" /> Try again</Button></Link>
        <Link href="/track-order"><Button size="lg" variant="secondary">Track order <ArrowRight className="h-4 w-4" /></Button></Link>
      </div>
      <p className="mt-6 flex items-center gap-2 text-xs text-muted"><Frown className="h-3.5 w-3.5" /> Need help? Message us on WhatsApp.</p>
    </div>
  );
}
