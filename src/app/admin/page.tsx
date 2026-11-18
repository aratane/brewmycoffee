import Link from "next/link";
import { DollarSign, ShoppingBag, Receipt, TrendingUp, Coffee, ArrowUpRight, Boxes } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { toNumber, formatIDR, formatDate } from "@/lib/utils";
import { RevenueChart, PaymentMixChart } from "@/components/admin/analytics-charts";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type Series = Array<{ label: string; revenue: number; orders: number }>;

async function series(interval: string, format: string, limit: number): Promise<Series> {
  const rows = await prisma.$queryRawUnsafe<Array<{ bucket: Date; revenue: number; orders: number }>>(
    `SELECT date_trunc('${interval}', "createdAt") AS bucket,
            COALESCE(SUM("total"), 0) AS revenue,
            COUNT(*)::int AS orders
     FROM "transactions"
     WHERE status = 'COMPLETED' AND "createdAt" >= NOW() - INTERVAL '${limit} days'
     GROUP BY 1 ORDER BY 1 ASC`
  );
  return rows.map((r) => ({
    label: new Intl.DateTimeFormat("en-ID", format === "month" ? { month: "short" } : { day: "numeric", month: "short" }).format(new Date(r.bucket)),
    revenue: Number(r.revenue),
    orders: Number(r.orders),
  }));
}

export default async function AdminOverview() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [allTx, todayTx, orderCount, sold, best, recent, daily, weekly, monthly, mix, lowStock] = await Promise.all([
    prisma.transaction.aggregate({ where: { status: "COMPLETED" }, _sum: { total: true }, _count: true }),
    prisma.transaction.aggregate({ where: { status: "COMPLETED", createdAt: { gte: today } }, _sum: { total: true }, _count: true }),
    prisma.order.count(),
    prisma.orderItem.aggregate({ _sum: { quantity: true } }),
    prisma.product.findMany({ orderBy: { soldCount: "desc" }, take: 5, select: { id: true, name: true, soldCount: true, price: true, imageUrl: true } }),
    prisma.transaction.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { order: { select: { orderNumber: true, customerName: true } } } }),
    series("day", "day", 14),
    series("week", "day", 56),
    series("month", "month", 180),
    prisma.transaction.groupBy({ by: ["paymentMethod"], where: { status: "COMPLETED" }, _sum: { total: true } }),
    prisma.inventory.count({ where: { quantity: { lte: 0 } } }),
  ]);

  const revenue = toNumber(allTx._sum.total);
  const todayRevenue = toNumber(todayTx._sum.total);
  const aov = allTx._count ? revenue / allTx._count : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Good morning! Here's how the shop is doing ☕</h1>
        <p className="mt-1 text-sm text-muted">Live numbers straight from your database.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total revenue", value: formatIDR(revenue), sub: "All completed transactions", icon: DollarSign, tint: "bg-[#E9D5C3]" },
          { label: "Today's revenue", value: formatIDR(todayRevenue), sub: `${todayTx._count} transactions today`, icon: TrendingUp, tint: "bg-[#F2C8C7]/60" },
          { label: "Total orders", value: orderCount, sub: `${sold._sum.quantity ?? 0} cups sold`, icon: ShoppingBag, tint: "bg-[#D9B895]/50" },
          { label: "Average order", value: formatIDR(Math.round(aov)), sub: "Per completed transaction", icon: Receipt, tint: "bg-[#EAE3D0]" },
        ].map(({ label, value, sub, icon: Icon, tint }) => (
          <div key={label} className="rounded-3xl border border-beige/50 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between"><span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tint}`}><Icon className="h-5 w-5 text-mocha" /></span><ArrowUpRight className="h-4 w-4 text-emerald-600" /></div>
            <p className="mt-4 font-display text-2xl font-semibold">{value}</p>
            <p className="text-xs font-bold text-mocha">{label}</p>
            <p className="mt-1 text-[11px] text-muted">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-3xl border border-beige/50 bg-white p-5 shadow-soft xl:col-span-2">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Daily sales · last 14 days</h2><Badge tone="success">Live</Badge></div>
          <RevenueChart data={daily} />
        </div>
        <div className="rounded-3xl border border-beige/50 bg-white p-5 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Payment methods</h2>
          <PaymentMixChart data={mix.map((m) => ({ name: m.paymentMethod, value: toNumber(m._sum.total) }))} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-3xl border border-beige/50 bg-white p-5 shadow-soft xl:col-span-2">
          <h2 className="font-display text-lg font-semibold">Revenue trend</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div><p className="mb-2 text-xs font-bold text-muted">Weekly · last 8 weeks</p><RevenueChart data={weekly} type="line" /></div>
            <div><p className="mb-2 text-xs font-bold text-muted">Monthly · last 6 months</p><RevenueChart data={monthly} /></div>
          </div>
        </div>
        <div className="rounded-3xl border border-beige/50 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Best sellers</h2><Coffee className="h-5 w-5 text-caramel" /></div>
          <div className="mt-4 space-y-3">
            {best.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream text-xs font-bold">{i + 1}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{p.name}</p><p className="text-[11px] text-muted">{formatIDR(toNumber(p.price))}</p></div>
                <Badge tone="pink">{p.soldCount} sold</Badge>
              </div>
            ))}
          </div>
          {lowStock > 0 && <Link href="/admin/inventory" className="mt-5 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700"><Boxes className="h-4 w-4" /> {lowStock} ingredient(s) out of stock — review inventory</Link>}
        </div>
      </div>

      <div className="rounded-3xl border border-beige/50 bg-white p-5 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Recent transactions</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-beige/50 text-[11px] uppercase tracking-wider text-muted"><tr><th className="py-2">Number</th><th>Order</th><th>Customer</th><th>Method</th><th>Status</th><th className="text-right">Total</th><th>Date</th></tr></thead>
            <tbody>
              {recent.map((t) => (
                <tr key={t.id} className="border-b border-beige/30 last:border-0">
                  <td className="py-3 font-semibold">{t.transactionNumber}</td>
                  <td className="text-muted">{t.order?.orderNumber ?? "—"}</td>
                  <td className="text-muted">{t.order?.customerName ?? "Walk-in"}</td>
                  <td><Badge>{t.paymentMethod}</Badge></td>
                  <td><Badge tone={t.status === "COMPLETED" ? "success" : "warning"}>{t.status}</Badge></td>
                  <td className="text-right font-bold">{formatIDR(toNumber(t.total))}</td>
                  <td className="text-xs text-muted">{formatDate(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
