import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";
import { PaymentPanel, type PaymentOrder } from "@/components/payment/payment-panel";

export const dynamic = "force-dynamic";

export default async function PaymentPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber: orderNumber.toUpperCase() },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!order) notFound();

  const payment = order.payments[0];
  const data: PaymentOrder = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: toNumber(order.total),
    subtotal: toNumber(order.subtotal),
    tax: toNumber(order.tax),
    createdAt: order.createdAt.toISOString(),
    customerName: order.customerName,
    type: order.type,
    items: order.items.map((i) => ({ nameSnapshot: i.nameSnapshot, quantity: i.quantity, lineTotal: toNumber(i.lineTotal) })),
    payment: payment ? {
      id: payment.id,
      method: payment.method,
      status: payment.status,
      amount: toNumber(payment.amount),
      qrisString: payment.qrisString,
      vaNumber: payment.vaNumber,
      bank: payment.bank,
      proofUrl: payment.proofUrl,
      expirationAt: payment.expirationAt?.toISOString() ?? null,
      metadata: payment.metadata,
    } : null,
  };

  return <PaymentPanel order={data} />;
}
