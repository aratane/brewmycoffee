import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, toNumber, formatIDR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AccountOrders() {
  const session = await auth();
  const customer = await prisma.customer.findUnique({
    where: { userId: session!.user.id },
    include: { orders: { orderBy: { createdAt: "desc" }, include: { items: true, payments: { take: 1 } } } },
  });

  return (
    <div className="rounded-3xl border border-beige/50 bg-white/70 p-6 shadow-soft">
      <h2 className="font-display text-xl font-semibold">Your order history</h2>
      <div className="mt-5 space-y-4">
        {!customer?.orders.length && <p className="py-10 text-center text-sm text-muted">No orders yet. Your coffee journey starts here! 🐰</p>}
        {customer?.orders.map((o) => (
          <div key={o.id} className="rounded-2xl border border-beige/50 bg-cream/30 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-display text-lg font-semibold">{o.orderNumber}</p><p className="text-xs text-muted">{formatDateTime(o.createdAt)} · {o.type.replace("_", " ")}</p></div>
              <div className="flex items-center gap-3"><Badge tone={o.status === "COMPLETED" ? "success" : o.status === "CANCELLED" ? "danger" : "warning"}>{o.status.replace("_", " ")}</Badge><span className="font-bold">{formatIDR(toNumber(o.total))}</span></div>
            </div>
            <div className="mt-4 space-y-1 border-t border-beige/40 pt-3">
              {o.items.map((i, idx) => <div key={idx} className="flex justify-between text-sm"><span className="text-muted">{i.quantity}× {i.nameSnapshot} <span className="text-[10px]">({i.size?.toLowerCase()} · {i.temperature?.toLowerCase()})</span></span><span>{formatIDR(toNumber(i.lineTotal))}</span></div>)}
            </div>
            <div className="mt-4 flex gap-2">
              <Link href={`/payment/${o.orderNumber}`}><Button size="sm" variant="secondary">View details</Button></Link>
              <Link href="/track-order"><Button size="sm" variant="ghost">Track order</Button></Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
