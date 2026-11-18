"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatDateTime, formatIDR } from "@/lib/utils";

export type AdminOrder = {
  id: string; orderNumber: string; source: string; type: string; status: string;
  customerName: string; total: number; createdAt: string; notes: string | null;
  items: Array<{ nameSnapshot: string; quantity: number; lineTotal: number; size: string | null; temperature: string | null; note: string | null }>;
};

const NEXT: Record<string, string[]> = {
  PENDING_PAYMENT: ["CANCELLED"],
  PAID: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["COMPLETED", "CANCELLED"],
};

export function OrdersManager({ orders }: { orders: AdminOrder[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [viewing, setViewing] = useState<AdminOrder | null>(null);
  const [busy, setBusy] = useState(false);

  const changeStatus = async (id: string, status: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not update order");
      toast.success(`Order moved to ${status.toLowerCase()}!`);
      window.location.reload();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Please try again"); }
    finally { setBusy(false); }
  };

  const filtered = orders.filter((o) => (filter === "ALL" || o.status === filter) && (o.orderNumber.toLowerCase().includes(query.toLowerCase()) || o.customerName.toLowerCase().includes(query.toLowerCase())));

  return (
    <div className="rounded-3xl border border-beige/50 bg-white p-5 shadow-soft">
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mocha/50" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search orders..." className="pl-9" /></div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-artisan w-52">
          <option value="ALL">All statuses</option>
          {["PENDING_PAYMENT", "PAID", "CONFIRMED", "PREPARING", "READY", "COMPLETED", "CANCELLED"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-beige/50 text-[11px] uppercase tracking-wider text-muted"><tr><th className="py-2">Order</th><th>Customer</th><th>Source</th><th>Type</th><th>Status</th><th>Total</th><th>Date</th><th /></tr></thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-beige/30 text-xs last:border-0">
                <td className="py-3 font-bold">{o.orderNumber}</td>
                <td className="text-muted">{o.customerName}</td>
                <td><Badge tone={o.source === "POS" ? "info" : "pink"}>{o.source}</Badge></td>
                <td className="text-muted">{o.type.replace("_", " ")}</td>
                <td><Badge tone={o.status === "COMPLETED" ? "success" : o.status === "CANCELLED" ? "danger" : "warning"}>{o.status.replace("_", " ")}</Badge></td>
                <td className="font-bold">{formatIDR(o.total)}</td>
                <td className="text-muted">{formatDateTime(o.createdAt)}</td>
                <td><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => setViewing(o)} aria-label="View"><Eye className="h-4 w-4" /></Button>{(NEXT[o.status] ?? []).filter((s) => s !== "CANCELLED").map((s) => <Button key={s} size="sm" variant="secondary" disabled={busy} onClick={() => changeStatus(o.id, s)}>{s.toLowerCase()}</Button>)}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent>
          <DialogTitle>Order {viewing?.orderNumber}</DialogTitle>
          {viewing && (
            <div className="mt-4 space-y-3 text-sm">
              <p className="text-muted">{viewing.customerName} · {formatDateTime(viewing.createdAt)}</p>
              <div className="rounded-2xl bg-cream/50 p-4">
                {viewing.items.map((i, idx) => <div key={idx} className="flex justify-between py-1"><span>{i.quantity}× {i.nameSnapshot} <span className="text-xs text-muted">({i.size?.toLowerCase()} · {i.temperature?.toLowerCase()})</span></span><span>{formatIDR(i.lineTotal)}</span></div>)}
              </div>
              {viewing.notes && <p className="text-xs italic text-muted">Note: “{viewing.notes}”</p>}
              <div className="flex justify-between border-t border-beige/40 pt-3 font-bold"><span>Total</span><span>{formatIDR(viewing.total)}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
