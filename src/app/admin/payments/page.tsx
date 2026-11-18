import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";
import { guardPage } from "@/lib/rbac";
import { AdminHeader } from "@/components/admin/admin-ui";
import { PaymentsManager } from "@/components/admin/payments-manager";

export const dynamic = "force-dynamic";

export default async function AdminPayments() {
  await guardPage("ADMIN");
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" }, take: 100,
    include: { order: { select: { orderNumber: true, customerName: true } } },
  });
  return (
    <div>
      <AdminHeader title="Payments" description="Review gateway payments and verify manual bank transfers." />
      <PaymentsManager payments={payments.map((p) => ({
        id: p.id, orderNumber: p.order.orderNumber, method: p.method, status: p.status,
        amount: toNumber(p.amount), bank: p.bank, vaNumber: p.vaNumber, proofUrl: p.proofUrl,
        createdAt: p.createdAt.toISOString(), paidAt: p.paidAt?.toISOString() ?? null,
        customerName: p.order.customerName, metadata: p.metadata,
      }))} />
    </div>
  );
}
