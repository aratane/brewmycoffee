"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatIDR, formatDateTime } from "@/lib/utils";

export type ReceiptData = {
  transactionNumber: string;
  cashier: string;
  date: string;
  customerName: string;
  orderType: string;
  tableNumber?: string | null;
  items: Array<{ name: string; quantity: number; unitPrice: number; lineTotal: number; size?: string | null }>;
  subtotal: number;
  discount: number;
  tax: number;
  serviceCharge?: number;
  total: number;
  paymentMethod: string;
  amountTendered?: number | null;
  change?: number | null;
  status: string;
  width?: 58 | 80;
};

export function Receipt({ data, showPrint = true }: { data: ReceiptData; showPrint?: boolean }) {
  const print = () => window.print();
  return (
    <div>
      {showPrint && <Button variant="secondary" size="sm" onClick={print} className="mb-4 no-print"><Printer className="h-4 w-4" /> Print receipt</Button>}
      <div
        id="receipt"
        className="receipt-paper print-area mx-auto bg-white p-4 shadow-soft"
        style={{ width: data.width === 58 ? "58mm" : "80mm", maxWidth: "100%", fontSize: data.width === 58 ? 9 : 11 }}
      >
        <div className="text-center">
          <p className="text-lg">🐰</p>
          <p className="font-bold uppercase tracking-wide">Artisan Brew Co.</p>
          <p className="text-[9px]">Every Cup, A Little Happiness.</p>
          <p className="mt-1 text-[9px]">Jl. Kopi Sensor No. 12, Jakarta Selatan</p>
          <p className="text-[9px]">+62 812-3456-7890</p>
        </div>
        <div className="my-2 border-t border-dashed border-black/40" />
        <p className="font-bold">{data.transactionNumber}</p>
        <p className="text-[9px]">Cashier: {data.cashier}</p>
        <p className="text-[9px]">{formatDateTime(data.date)}</p>
        <p className="text-[9px]">{data.orderType.replace("_", " ")}{data.tableNumber ? ` · Table ${data.tableNumber}` : ""} · {data.customerName}</p>
        <div className="my-2 border-t border-dashed border-black/40" />
        <table className="w-full text-left">
          <tbody>
            {data.items.map((i, idx) => (
              <tr key={idx} style={{ verticalAlign: "top" }}>
                <td className="pr-1">{i.quantity}x</td>
                <td className="flex-1">{i.name}{i.size ? ` (${i.size.toLowerCase()})` : ""}</td>
                <td className="text-right">{formatIDR(i.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="my-2 border-t border-dashed border-black/40" />
        <Row label="Subtotal" value={formatIDR(data.subtotal)} />
        {data.discount > 0 && <Row label="Discount" value={`- ${formatIDR(data.discount)}`} />}
        <Row label="Tax (10%)" value={formatIDR(data.tax)} />
        {!!data.serviceCharge && <Row label="Service charge" value={formatIDR(data.serviceCharge)} />}
        <div className="my-1 border-t border-black" />
        <Row label="TOTAL" value={formatIDR(data.total)} bold />
        <div className="my-2 border-t border-dashed border-black/40" />
        <Row label="Payment" value={data.paymentMethod.replace("_", " ")} />
        {data.amountTendered != null && <Row label="Tendered" value={formatIDR(data.amountTendered)} />}
        {data.change != null && <Row label="Change" value={formatIDR(data.change)} />}
        <Row label="Status" value={data.status} />
        <div className="my-2 border-t border-dashed border-black/40" />
        <p className="text-center text-[9px]">Thank you! Come back for more happy cups. 💕</p>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return <div className={`flex justify-between ${bold ? "font-bold" : ""}`}><span>{label}</span><span>{value}</span></div>;
}
