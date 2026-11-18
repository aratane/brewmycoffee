import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";
import { guardPage } from "@/lib/rbac";
import { AdminHeader } from "@/components/admin/admin-ui";
import { OrdersManager } from "@/components/admin/orders-manager";

export const dynamic = "force-dynamic";

export default async function AdminOrders() {
  await guardPage("CASHIER");
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" }, take: 100,
    include: { items: true },
  });
  return (
    <div>
      <AdminHeader title="Orders" description="Every online and POS order in one place." />
      <OrdersManager orders={orders.map((o) => ({
        id: o.id, orderNumber: o.orderNumber, source: o.source, type: o.type, status: o.status,
        customerName: o.customerName, total: toNumber(o.total), createdAt: o.createdAt.toISOString(), notes: o.notes,
        items: o.items.map((i) => ({ nameSnapshot: i.nameSnapshot, quantity: i.quantity, lineTotal: toNumber(i.lineTotal), size: i.size, temperature: i.temperature, note: i.note })),
      }))} />
    </div>
  );
}
