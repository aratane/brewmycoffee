import { prisma } from "@/lib/prisma";
import { toNumber, formatIDR, formatDateTime } from "@/lib/utils";
import { guardPage } from "@/lib/rbac";
import { AdminHeader, AdminCard } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { TransactionReceiptDialog } from "@/components/admin/transaction-receipt";
import type { ReceiptData } from "@/components/pos/receipt";

export const dynamic = "force-dynamic";

export default async function AdminTransactions() {
  await guardPage("CASHIER");
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" }, take: 100,
    include: { order: { include: { items: true, table: { select: { number: true } } } }, cashier: { include: { user: { select: { name: true } } } } },
  });

  return (
    <div>
      <AdminHeader title="Transactions" description="Every sale, online and in-store, with printable receipts." />
      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-beige/50 text-[11px] uppercase tracking-wider text-muted"><tr><th className="py-2">Number</th><th>Order</th><th>Cashier</th><th>Method</th><th>Status</th><th>Total</th><th>Date</th><th /></tr></thead>
            <tbody>
              {transactions.map((t) => {
                const receipt: ReceiptData = {
                  transactionNumber: t.transactionNumber,
                  cashier: t.cashier?.user?.name ?? "Online",
                  date: t.createdAt.toISOString(),
                  customerName: t.order?.customerName ?? "Walk-in Guest",
                  orderType: t.order?.type ?? "TAKEAWAY",
                  tableNumber: t.order?.table?.number,
                  items: (t.order?.items ?? []).map((i) => ({ name: i.nameSnapshot, quantity: i.quantity, unitPrice: toNumber(i.unitPrice), lineTotal: toNumber(i.lineTotal), size: i.size })),
                  subtotal: toNumber(t.subtotal), discount: toNumber(t.discount), tax: toNumber(t.tax), serviceCharge: toNumber(t.serviceCharge),
                  total: toNumber(t.total), paymentMethod: t.paymentMethod, amountTendered: t.amountTendered ? toNumber(t.amountTendered) : null,
                  change: t.change ? toNumber(t.change) : null, status: t.status,
                };
                return (
                  <tr key={t.id} className="border-b border-beige/30 text-xs last:border-0">
                    <td className="py-3 font-bold">{t.transactionNumber}</td>
                    <td className="text-muted">{t.order?.orderNumber ?? "—"}</td>
                    <td className="text-muted">{receipt.cashier}</td>
                    <td><Badge>{t.paymentMethod.replace("_", " ")}</Badge></td>
                    <td><Badge tone={t.status === "COMPLETED" ? "success" : "warning"}>{t.status}</Badge></td>
                    <td className="font-bold">{formatIDR(toNumber(t.total))}</td>
                    <td className="text-muted">{formatDateTime(t.createdAt)}</td>
                    <td><TransactionReceiptDialog data={receipt} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
