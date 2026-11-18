import Link from "next/link";
import { Gift, Sparkles, Ticket, Heart, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toNumber, formatIDR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function RewardsPage() {
  const session = await auth();
  const [customer, vouchers] = await Promise.all([
    prisma.customer.findUnique({ where: { userId: session!.user.id }, include: { loyalty: true, wishlist: { include: { product: true } } } }),
    prisma.voucher.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  const points = customer?.loyalty?.points ?? 0;
  const tier = customer?.loyalty?.tier ?? "Bean";
  const next = points >= 2000 ? 2000 : points >= 1000 ? 2000 : points >= 500 ? 1000 : 500;
  const progress = Math.min(100, (points / next) * 100);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-caramel to-mocha p-7 text-warm shadow-soft">
        <div className="flex items-start justify-between">
          <div><p className="text-xs font-bold uppercase tracking-wider text-warm/70">Loyalty balance</p><p className="mt-2 font-display text-5xl font-semibold">{points}</p><p className="text-sm text-warm/75">points · worth {formatIDR(points * 1000)}</p></div>
          <span className="rounded-full bg-warm/15 p-3"><Sparkles className="h-6 w-6 text-pink" /></span>
        </div>
        <div className="mt-6"><div className="flex justify-between text-xs font-bold"><span>{tier} member</span><span>{next} pts to next tier</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-warm/20"><div className="h-full rounded-full bg-pink" style={{ width: `${progress}%` }} /></div></div>
      </div>

      <div className="rounded-3xl border border-beige/50 bg-white/70 p-6 shadow-soft">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Ticket className="h-5 w-5 text-caramel" /> Available vouchers</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {vouchers.map((v) => (
            <div key={v.id} className="rounded-2xl border border-dashed border-caramel/40 bg-cream/40 p-4">
              <div className="flex items-center justify-between"><span className="font-display text-lg font-bold">{v.code}</span><Badge tone="pink">{v.type === "PERCENT" ? `${toNumber(v.value)}% off` : `${formatIDR(toNumber(v.value))} off`}</Badge></div>
              <p className="mt-2 text-xs text-muted">Min. order {formatIDR(toNumber(v.minOrder))}{v.expiresAt ? ` · expires ${v.expiresAt.toLocaleDateString("id-ID")}` : ""}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">Use these codes at checkout. Enter them in the "Little extras" section.</p>
      </div>

      <div className="rounded-3xl border border-beige/50 bg-white/70 p-6 shadow-soft">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Heart className="h-5 w-5 text-caramel" /> Your wishlist</h2>
        <div className="mt-5 space-y-2">
          {!customer?.wishlist.length && <p className="py-6 text-center text-sm text-muted">Nothing saved yet. Tap the heart on a drink you love!</p>}
          {customer?.wishlist.map((w) => (
            <Link key={w.id} href={`/menu/${w.product.slug}`} className="flex items-center justify-between rounded-2xl bg-cream/40 p-4 transition hover:bg-cream/70">
              <span className="text-sm font-bold">{w.product.name}</span>
              <span className="flex items-center gap-2 text-sm font-semibold text-mocha">{formatIDR(toNumber(w.product.price))} <ArrowRight className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </div>
      <p className="flex items-center gap-2 text-xs text-muted"><Gift className="h-4 w-4 text-caramel" /> Earn points automatically every time an order is completed.</p>
    </div>
  );
}
