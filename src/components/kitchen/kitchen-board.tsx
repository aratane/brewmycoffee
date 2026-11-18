"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Clock, Check, Flame, Bell, Users, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatTime } from "@/lib/utils";
import { useOrderStream, type StreamOrder } from "@/hooks/use-order-stream";

const COLUMNS = [
  { status: "PAID", label: "New Orders", icon: Bell, next: "CONFIRMED", tone: "warning" as const },
  { status: "CONFIRMED", label: "Confirmed", icon: Clock, next: "PREPARING", tone: "info" as const },
  { status: "PREPARING", label: "Preparing", icon: Flame, next: "READY", tone: "pink" as const },
  { status: "READY", label: "Ready for pickup", icon: Check, next: "COMPLETED", tone: "success" as const },
];

export function KitchenBoard() {
  const { orders, loading, error } = useOrderStream(4000);
  const [busy, setBusy] = useState<string | null>(null);

  const advance = async (order: StreamOrder, status: string) => {
    setBusy(order.id);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not update order");
      toast.success(`${order.orderNumber} → ${status.toLowerCase()}`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Please try again"); }
    finally { setBusy(null); }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-display text-2xl font-semibold">Kitchen Display 🐰👨‍🍳</h1><p className="mt-1 text-sm text-muted">Live orders, updated automatically. One tap to move things along.</p></div>
        <div className="flex items-center gap-2"><span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Live</span><Badge tone="info">{orders.length} active</Badge></div>
      </div>
      {error && <div className="mb-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error} — retrying automatically...</div>}
      {loading && <p className="py-10 text-center text-sm text-muted">Brewing the kitchen feed...</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const list = orders.filter((o) => o.status === col.status);
          const Icon = col.icon;
          return (
            <div key={col.status} className="rounded-3xl border border-beige/50 bg-white/70 p-4 shadow-soft">
              <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-display text-base font-semibold"><Icon className="h-4 w-4 text-caramel" /> {col.label}</h2><Badge tone={col.tone}>{list.length}</Badge></div>
              <div className="mt-4 space-y-3">
                {list.length === 0 && <p className="rounded-2xl border border-dashed border-beige/60 p-5 text-center text-xs text-muted">Nothing here right now.</p>}
                <AnimatePresence>
                  {list.map((o) => (
                    <motion.div key={o.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className={cn("rounded-2xl border p-4 shadow-sm", col.status === "READY" ? "border-emerald-300 bg-emerald-50/60" : "border-beige/50 bg-warm")}>
                      <div className="flex items-start justify-between gap-2">
                        <div><p className="font-display text-sm font-bold">{o.orderNumber}</p><p className="text-[10px] text-muted"><Clock className="mr-1 inline h-3 w-3" />{formatTime(o.createdAt)} · {o.customerName}</p></div>
                        <Badge>{o.table ? `Table ${o.table.number}` : o.type.replace("_", " ")}</Badge>
                      </div>
                      <div className="mt-3 space-y-2 border-t border-beige/40 pt-3">
                        {o.items.map((i) => (
                          <div key={i.id} className="text-xs">
                            <p className="font-bold">{i.quantity}× {i.nameSnapshot} <span className="font-normal text-muted">({i.size?.toLowerCase()} · {i.temperature?.toLowerCase()})</span></p>
                            {(i.extraShot || i.extraMilk || i.sugarLevel !== 100 || i.iceLevel !== 100) && <p className="text-[10px] text-caramel">Sugar {i.sugarLevel}% · Ice {i.iceLevel}%{i.extraShot ? " · extra shot" : ""}{i.extraMilk ? " · extra milk" : ""}</p>}
                            {i.note && <p className="mt-0.5 text-[10px] italic text-red-600">{i.note}</p>}
                          </div>
                        ))}
                      </div>
                      {o.notes && <p className="mt-3 rounded-lg bg-amber-50 p-2 text-[10px] italic text-amber-800">Customer note: “{o.notes}”</p>}
                      <Button size="sm" className="mt-3 w-full" disabled={busy === o.id} onClick={() => advance(o, col.next)}>
                        {busy === o.id ? "Working..." : col.status === "READY" ? "Mark completed" : `Move to ${col.next.toLowerCase()}`}
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted"><RefreshCw className="h-3.5 w-3.5" /> Refreshes every 4 seconds · <Users className="h-3.5 w-3.5" /> Shared with the whole team</p>
    </div>
  );
}
