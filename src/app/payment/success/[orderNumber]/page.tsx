import Link from "next/link";
import { notFound } from "next/navigation";
import { PartyPopper, ArrowRight, Coffee } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { toNumber, formatIDR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CelebrationMount } from "@/components/payment/celebration-mount";

export const revalidate = 0;

export default async function SuccessPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({ where: { orderNumber: orderNumber.toUpperCase() }, include: { items: true, payments: { take: 1 } } });
  if (!order) notFound();

  return (
    <div className="container-artisan flex min-h-[78vh] flex-col items-center justify-center py-12 text-center">
      <div className="h-80 w-full max-w-xl"><CelebrationMount /></div>
      <Badge tone="success" className="mt-2"><PartyPopper className="h-3 w-3" /> Payment confirmed</Badge>
      <h1 className="heading-lg mt-5">Yay! Your Coffee Is Brewing!</h1>
      <p className="mt-3 max-w-md text-muted">Buni the bunny barista is doing a little happy dance. Your order is confirmed and we'll start preparing it right away.</p>
      <div className="mt-8 w-full max-w-md rounded-3xl border border-beige/50 bg-white/70 p-6 text-left shadow-soft">
        <div className="flex justify-between text-sm"><span className="text-muted">Order number</span><span className="font-bold">{order.orderNumber}</span></div>
        <div className="mt-2 flex justify-between text-sm"><span className="text-muted">Customer</span><span className="font-bold">{order.customerName}</span></div>
        <div className="mt-2 flex justify-between text-sm"><span className="text-muted">Amount paid</span><span className="font-bold text-mocha">{formatIDR(toNumber(order.total))}</span></div>
        <div className="mt-2 flex justify-between text-sm"><span className="text-muted">Payment method</span><span className="font-bold">{order.payments[0]?.method ?? "—"}</span></div>
        <div className="mt-4 border-t border-beige/40 pt-4">
          {order.items.map((i, idx) => <div key={idx} className="flex justify-between text-sm"><span className="text-muted">{i.quantity}× {i.nameSnapshot}</span><span>{formatIDR(toNumber(i.lineTotal))}</span></div>)}
        </div>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/track-order"><Button size="lg">Track my order <ArrowRight className="h-4 w-4" /></Button></Link>
        <Link href="/menu"><Button size="lg" variant="secondary"><Coffee className="h-4 w-4" /> Order another cup</Button></Link>
      </div>
    </div>
  );
}
