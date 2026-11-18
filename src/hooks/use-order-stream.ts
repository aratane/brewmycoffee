"use client";

import { useEffect, useState } from "react";

export type StreamOrder = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  notes: string | null;
  type: string;
  createdAt: string;
  table: { number: string } | null;
  items: Array<{
    id: string;
    nameSnapshot: string;
    quantity: number;
    size: string | null;
    temperature: string | null;
    sugarLevel: number;
    iceLevel: number;
    extraShot: boolean;
    extraMilk: boolean;
    addons: unknown;
    note: string | null;
    lineTotal: number;
  }>;
};

/**
 * Realtime order feed.
 * When NEXT_PUBLIC_SUPABASE_URL + an ANON key are present this is where a
 * Supabase Realtime channel subscription is attached. Without them, a bounded
 * polling loop gives equivalent behaviour for single-instance deployments.
 */
export function useOrderStream(intervalMs = 4000) {
  const [orders, setOrders] = useState<StreamOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/orders/live", { cache: "no-store" });
        if (!res.ok) throw new Error("Unable to reach the kitchen feed");
        const data = (await res.json()) as { orders: StreamOrder[] };
        if (active) {
          setOrders(data.orders);
          setError(null);
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Connection lost");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const timer = window.setInterval(load, intervalMs);
    let unsubscribe: (() => void) | undefined;

    // Supabase Realtime when configured; polling remains as a reliable fallback.
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      import("@supabase/supabase-js")
        .then(({ createClient }) => {
          if (!active) return;
          const supabase = createClient(url, key);
          const channel = supabase
            .channel("artisan-orders")
            .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
            .subscribe();
          unsubscribe = () => { void supabase.removeChannel(channel); };
        })
        .catch(() => { /* keep polling */ });
    }

    return () => {
      active = false;
      window.clearInterval(timer);
      unsubscribe?.();
    };
  }, [intervalMs]);

  return { orders, loading, error };
}

export function useOrderTracking(orderNumber: string, intervalMs = 6000) {
  const [data, setData] = useState<{ status: string; order: StreamOrder | null } | null>(null);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/orders/track?number=${encodeURIComponent(orderNumber)}`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (active) setData(json);
        }
      } catch { /* keep previous state while offline */ }
    };
    load();
    const timer = window.setInterval(load, intervalMs);
    return () => { active = false; window.clearInterval(timer); };
  }, [orderNumber, intervalMs]);
  return data;
}
