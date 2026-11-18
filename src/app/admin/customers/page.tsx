import { prisma } from "@/lib/prisma";
import { toNumber, formatDate } from "@/lib/utils";
import { guardPage } from "@/lib/rbac";
import { AdminHeader, AdminCard, StatPill } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminCustomers() {
  await guardPage("ADMIN");
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, isActive: true } },
      loyalty: true,
      _count: { select: { orders: true } },
    },
  });
  const total = customers.length;
  const withPoints = customers.filter((c) => (c.loyalty?.points ?? 0) > 0).length;

  return (
    <div>
      <AdminHeader title="Customers" description="The lovely people behind every happy cup." />
      <div className="mb-5 grid gap-3 sm:grid-cols-3"><StatPill label="Total customers" value={total} /><StatPill label="With loyalty points" value={withPoints} /><StatPill label="Repeat customers" value={customers.filter((c) => c._count.orders > 1).length} /></div>
      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-beige/50 text-[11px] uppercase tracking-wider text-muted"><tr><th className="py-2">Customer</th><th>Email</th><th>Phone</th><th>Orders</th><th>Points</th><th>Tier</th><th>Joined</th></tr></thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-beige/30 text-xs last:border-0">
                  <td className="py-3 font-bold">{c.name}</td>
                  <td className="text-muted">{c.email ?? c.user?.email ?? "—"}</td>
                  <td className="text-muted">{c.phone ?? "—"}</td>
                  <td>{c._count.orders}</td>
                  <td className="font-bold">{c.loyalty?.points ?? 0}</td>
                  <td><Badge tone="pink">{c.loyalty?.tier ?? "Bean"}</Badge></td>
                  <td className="text-muted">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
