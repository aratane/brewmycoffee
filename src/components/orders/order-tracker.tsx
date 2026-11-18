"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Check, Coffee, Sparkles, PackageCheck, ChefHat, ClipboardCheck, PartyPopper, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STEPS } from "@/lib/constants";
import { useOrderTracking } from "@/hooks/use-order-stream";

const STEP_ICONS = [Clock, ClipboardCheck, ChefHat, Coffee, PackageCheck, PartyPopper];

export function OrderTracker() {
  const [number, setNumber] = useState("");
  const [query, setQuery] = useState("");
  const [notFound, setNotFound] = useState(false);
  const data = useOrderTracking(query, 5000);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotFound(false);
    setQuery(number.trim().toUpperCase());
  };

  const status = data?.status;
  const currentIndex = status ? ORDER_STATUS_STEPS.indexOf(status as (typeof ORDER_STATUS_STEPS)[number]) : -1;

  return (
    <div>
      <form onSubmit={search} className="mx-auto flex max-w-xl gap-2">
        <Input value={number} onChange={(e) => { setNumber(e.target.value.toUpperCase()); setNotFound(false); }} placeholder="Enter your order number (e.g. ABC-260118-A1B2C3)" className="h-12" />
        <Button type="submit" size="lg" className="shrink-0"><Search className="h-4 w-4" /> Track</Button>
      </form>

      {query && data === null && <p className="mt-6 text-center text-sm text-muted">Searching for your order...</p>}
      {notFound && <p className="mt-6 text-center text-sm text-red-600">We couldn't find that order. Double-check the number and try again.</p>}

      {data?.order && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mt-10 max-w-3xl rounded-3xl border border-beige/50 bg-white/75 p-7 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-caramel">Order {data.order.orderNumber}</p>
              <h2 className="mt-1 font-display text-2xl font-semibold">Your Bunny Barista Is On It!</h2>
              <p className="mt-1 text-xs text-muted">Placed {formatDateTime(data.order.createdAt)} · {data.order.customerName}</p>
            </div>
            <Badge tone={status === "COMPLETED" ? "success" : status === "CANCELLED" ? "danger" : "info"}>{ORDER_STATUS_LABELS[status ?? ""] ?? status}</Badge>
          </div>

          <div className="mt-9 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {ORDER_STATUS_STEPS.map((step, i) => {
              const Icon = STEP_ICONS[i];
              const done = currentIndex >= i;
              const active = currentIndex === i;
              return (
                <div key={step} className="flex flex-col items-center text-center">
                  <span className={cn("flex h-11 w-11 items-center justify-center rounded-full border-2 transition", done ? "border-mocha bg-mocha text-warm" : "border-beige/70 bg-cream/40 text-mocha/35")}>
                    {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </span>
                  <span className={cn("mt-2 text-[10px] font-bold leading-tight", active ? "text-mocha" : "text-muted")}>{ORDER_STATUS_LABELS[step]}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-9 rounded-2xl bg-cream/50 p-5">
            <p className="text-sm font-bold">What's in your order</p>
            <div className="mt-3 space-y-2">
              {data.order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted">{item.quantity}× {item.nameSnapshot} <span className="text-[10px]">({item.size?.toLowerCase()} · {item.temperature?.toLowerCase()})</span></span>
                  <span className="font-semibold">Rp{Number(item.lineTotal).toLocaleString("id-ID")}</span>
                </div>
              ))}
            </div>
            {data.order.notes && <p className="mt-3 border-t border-beige/40 pt-3 text-xs italic text-muted">Note: “{data.order.notes}”</p>}
          </div>

          <p className="mt-5 flex items-center gap-2 text-xs text-muted"><Sparkles className="h-4 w-4 text-caramel" /> This page updates automatically. Keep it open to watch your cup come to life!</p>
        </motion.div>
      )}

      {query && data && !data.order && !notFound && <p className="mt-6 text-center text-sm text-red-600">Order not found.</p>}
    </div>
  );
}
