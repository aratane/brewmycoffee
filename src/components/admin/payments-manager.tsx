"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Check, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatIDR, formatDateTime } from "@/lib/utils";

export type AdminPayment = {
  id: string; orderNumber: string; method: string; status: string; amount: number;
  bank: string | null; vaNumber: string | null; proofUrl: string | null;
  createdAt: string; paidAt: string | null; customerName: string;
  metadata: unknown;
};

export function PaymentsManager({ payments }: { payments: AdminPayment[] }) {
  const [viewing, setViewing] = useState<AdminPayment | null>(null);
  const [busy, setBusy] = useState(false);

  const verify = async (id: string, action: "VERIFY" | "REJECT") => {
    setBusy(true);
    try {
      const res = await fetch(`/api/payments/${id}/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not update payment");
      toast.success(action === "VERIFY" ? "Payment verified! Order confirmed." : "Payment rejected.");
      setViewing(null);
      window.location.reload();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Please try again"); }
    finally { setBusy(false); }
  };

  return (
    <div className="rounded-3xl border border-beige/50 bg-white p-5 shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-beige/50 text-[11px] uppercase tracking-wider text-muted"><tr><th className="py-2">Order</th><th>Customer</th><th>Method</th><th>Bank / VA</th><th>Amount</th><th>Status</th><th>Date</th><th /></tr></thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-beige/30 text-xs last:border-0">
                <td className="py-3 font-bold">{p.orderNumber}</td>
                <td className="text-muted">{p.customerName}</td>
                <td><Badge>{p.method.replace("_", " ")}</Badge></td>
                <td className="text-muted">{p.bank ?? "—"} {p.vaNumber ? `· ${p.vaNumber}` : ""}</td>
                <td className="font-bold">{formatIDR(p.amount)}</td>
                <td><Badge tone={p.status === "PAID" || p.status === "VERIFIED" ? "success" : p.status === "REJECTED" || p.status === "FAILED" || p.status === "EXPIRED" ? "danger" : "warning"}>{p.status}</Badge></td>
                <td className="text-muted">{formatDateTime(p.createdAt)}</td>
                <td><Button variant="ghost" size="icon" onClick={() => setViewing(p)} aria-label="View payment"><ExternalLink className="h-4 w-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent>
          <DialogTitle>Payment · {viewing?.orderNumber}</DialogTitle>
          {viewing && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted">Method</p><p className="font-bold">{viewing.method.replace("_", " ")}</p></div>
                <div><p className="text-xs text-muted">Amount</p><p className="font-bold">{formatIDR(viewing.amount)}</p></div>
                <div><p className="text-xs text-muted">Status</p><p className="font-bold">{viewing.status}</p></div>
                <div><p className="text-xs text-muted">Account / VA</p><p className="font-bold">{viewing.vaNumber ?? "—"}</p></div>
              </div>
              {viewing.proofUrl && (
                <div className="rounded-2xl border border-beige/50 bg-cream/30 p-3">
                  <p className="mb-2 text-xs font-bold">Uploaded proof</p>
                  <div className="relative h-64 overflow-hidden rounded-xl bg-white"><Image src={viewing.proofUrl} alt="Transfer proof" fill sizes="500px" className="object-contain" /></div>
                </div>
              )}
              {(viewing.method === "BANK_TRANSFER" || viewing.method === "CASH") && viewing.status === "PENDING" && (
                <div className="flex gap-2">
                  <Button className="flex-1" disabled={busy || !viewing.proofUrl} onClick={() => verify(viewing.id, "VERIFY")}><Check className="h-4 w-4" /> Verify payment</Button>
                  <Button variant="destructive" disabled={busy} onClick={() => verify(viewing.id, "REJECT")}><X className="h-4 w-4" /> Reject</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
