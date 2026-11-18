import Link from "next/link";
import { Coffee, Gift, Star, ArrowRight, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toNumber, formatIDR, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function AccountOverview() {
  const session = await auth();
  const customer = await prisma.customer.findUnique({
    where: { userId: session!.user.id },
    include: {
      loyalty: true,
      orders: { orderBy: { createdAt: "desc" }, take: 4, include: { items: true } },
    },
  });
  const spent = customer?.orders.reduce((s, o) => s + toNumber(o.total), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total orders", value: customer?.orders.length ?? 0, icon: Coffee, color: "bg-cream" },
          { label: "Loyalty points", value: customer?.loyalty?.points ?? 0, icon: Sparkles, color: "bg-pink/40" },
          { label: "Lifetime spend", value: formatIDR(spent), icon: Gift, color: "bg-beige/40" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-3xl ${color} p-5 shadow-soft`}>
            <Icon className="h-5 w-5 text-caramel" />
            <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-beige/50 bg-white/70 p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Recent orders</h2>
          <Link href="/account/orders" className="flex items-center gap-1 text-xs font-bold text-mocha underline">See all <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="mt-5 space-y-3">
          {!customer?.orders.length && <p className="rounded-2xl bg-cream/50 p-5 text-center text-sm text-muted">No orders yet — let's change that! 🐰</p>}
          {customer?.orders.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream/40 p-4">
              <div><p className="text-sm font-bold">{o.orderNumber}</p><p className="text-xs text-muted">{formatDate(o.createdAt)} · {o.items.length} item(s)</p></div>
              <div className="flex items-center gap-3"><span className="text-sm font-bold">{formatIDR(toNumber(o.total))}</span><Badge tone={o.status === "COMPLETED" ? "success" : "warning"}>{o.status.replace("_", " ")}</Badge></div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-caramel to-mocha p-7 text-warm shadow-soft">
        <Star className="h-6 w-6 text-pink" />
        <h2 className="mt-3 font-display text-2xl font-semibold">You're a {customer?.loyalty?.tier ?? "Bean"} member!</h2>
        <p className="mt-2 text-sm text-warm/75">Earn 1 point for every Rp1.000 spent. Redeem points at checkout for a little extra happiness.</p>
        <Link href="/account/rewards" className="mt-4 inline-flex"><ButtonPreview /></Link>
      </div>
    </div>
  );
}

function ButtonPreview() {
  return <span className="inline-flex items-center gap-2 rounded-full bg-warm px-5 py-2.5 text-sm font-bold text-mocha">View rewards <ArrowRight className="h-4 w-4" /></span>;
}
