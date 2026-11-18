import { prisma } from "@/lib/prisma";
import { toNumber, formatIDR, formatDateTime } from "@/lib/utils";
import { guardPage } from "@/lib/rbac";
import { AdminHeader, AdminCard } from "@/components/admin/admin-ui";
import { RevenueChart } from "@/components/admin/analytics-charts";
import { Badge } from "@/components/ui/badge";
import { ToggleVoucherForm } from "@/components/admin/voucher-toggle";

export const dynamic = "force-dynamic";

export default async function AdminReports() {
  await guardPage("ADMIN");
  const [daily, categoryStats, paymentStats, vouchers, audit] = await Promise.all([
    prisma.$queryRawUnsafe<Array<{ bucket: Date; revenue: number; orders: number }>>(
      `SELECT date_trunc('day', "createdAt") AS bucket, COALESCE(SUM("total"),0) AS revenue, COUNT(*)::int AS orders
       FROM "transactions" WHERE status='COMPLETED' AND "createdAt" >= NOW() - INTERVAL '30 days' GROUP BY 1 ORDER BY 1 ASC`
    ),
    prisma.orderItem.groupBy({ by: ["productId"], _sum: { quantity: true, lineTotal: true } }),
    prisma.transaction.groupBy({ by: ["paymentMethod"], _sum: { total: true }, _count: true }),
    prisma.voucher.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: { select: { name: true } } } }),
  ]);

  const products = await prisma.product.findMany({ select: { id: true, name: true } });
  const top = categoryStats.sort((a, b) => toNumber(b._sum.lineTotal) - toNumber(a._sum.lineTotal)).slice(0, 8);

  return (
    <div>
      <AdminHeader title="Reports" description="Dig into the numbers that keep the coffee flowing." />
      <div className="grid gap-5 lg:grid-cols-3">
        <AdminCard className="lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">Revenue · last 30 days</h2>
          <div className="mt-4"><RevenueChart data={daily.map((d) => ({ label: new Date(d.bucket).toLocaleDateString("id-ID", { day: "numeric", month: "short" }), revenue: Number(d.revenue), orders: Number(d.orders) }))} /></div>
        </AdminCard>
        <AdminCard>
          <h2 className="font-display text-lg font-semibold">Sales by product</h2>
          <div className="mt-4 space-y-3">
            {top.map((t) => {
              const name = products.find((p) => p.id === t.productId)?.name ?? "Unknown";
              const value = toNumber(t._sum.lineTotal);
              const max = Math.max(...top.map((x) => toNumber(x._sum.lineTotal)), 1);
              return (
                <div key={t.productId}>
                  <div className="flex justify-between text-xs"><span className="font-semibold">{name}</span><span className="text-muted">{t._sum.quantity} sold</span></div>
                  <div className="mt-1 h-2 rounded-full bg-cream"><div className="h-full rounded-full bg-caramel" style={{ width: `${(value / max) * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
        </AdminCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <AdminCard>
          <h2 className="font-display text-lg font-semibold">Payment breakdown</h2>
          <div className="mt-4 space-y-2">
            {paymentStats.map((p) => (
              <div key={p.paymentMethod} className="flex items-center justify-between rounded-xl bg-cream/40 p-3 text-sm">
                <span className="font-semibold">{p.paymentMethod.replace("_", " ")} <span className="text-xs font-normal text-muted">({p._count} tx)</span></span>
                <span className="font-bold">{formatIDR(toNumber(p._sum.total))}</span>
              </div>
            ))}
          </div>
        </AdminCard>
        <AdminCard>
          <h2 className="font-display text-lg font-semibold">Vouchers</h2>
          <div className="mt-4 space-y-2">
            {vouchers.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-xl bg-cream/40 p-3 text-sm">
                <div><span className="font-bold">{v.code}</span><span className="ml-2 text-xs text-muted">{usedLabel(v.type, toNumber(v.value))} · {v.usedCount}/{v.usageLimit ?? "∞"} used</span></div>
                <div className="flex items-center gap-2"><Badge tone={v.isActive ? "success" : "danger"}>{v.isActive ? "Active" : "Off"}</Badge><ToggleVoucherForm id={v.id} /></div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      <AdminCard className="mt-5">
        <h2 className="font-display text-lg font-semibold">Audit log</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-beige/50 uppercase text-muted"><tr><th className="py-2">Action</th><th>Entity</th><th>User</th><th>Time</th></tr></thead>
            <tbody>{audit.map((a) => <tr key={a.id} className="border-b border-beige/30"><td className="py-2 font-semibold">{a.action}</td><td>{a.entity} {a.entityId ? `· ${a.entityId.slice(0, 8)}` : ""}</td><td className="text-muted">{a.user?.name ?? "System"}</td><td className="text-muted">{formatDateTime(a.createdAt)}</td></tr>)}</tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}

function usedLabel(type: string, value: number) {
  return type === "PERCENT" ? `${value}% off` : formatIDR(value);
}
