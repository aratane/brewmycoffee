"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Minus, History, PackagePlus } from "lucide-react";
import { createIngredient, type ActionState } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatIDR, toNumber } from "@/lib/utils";

export type StockRow = {
  id: string; ingredientId: string; ingredient: string; unit: string; quantity: number; minimum: number; unitCost: number;
  movements: Array<{ id: string; type: string; quantity: number; previousQty: number; newQty: number; note: string | null; createdAt: string }>;
};

export function InventoryManager({ rows }: { rows: StockRow[] }) {
  const [selected, setSelected] = useState<StockRow | null>(null);
  const [type, setType] = useState<"PURCHASE" | "ADJUSTMENT" | "WASTE" | "RETURN">("PURCHASE");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [ingredientState, ingredientAction, addingIngredient] = useActionState<ActionState, FormData>(createIngredient, { ok: false });
  useEffect(() => {
    if (ingredientState.ok) { toast.success("Ingredient added!"); window.location.reload(); }
  }, [ingredientState.ok]);

  const adjust = async () => {
    if (!selected || !qty) return;
    setBusy(true);
    try {
      const res = await fetch("/api/inventory/adjust", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryId: selected.id, ingredientId: selected.ingredientId, type, quantity: Number(qty), note }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not adjust stock");
      toast.success(`Stock updated: ${json.previous} → ${json.next}`);
      setSelected(null); setQty(""); setNote("");
      window.location.reload();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Please try again"); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild><Button variant="secondary"><PackagePlus className="h-4 w-4" /> Add ingredient</Button></DialogTrigger>
          <DialogContent>
            <DialogTitle>Add a new ingredient</DialogTitle>
            <form action={ingredientAction} className="mt-5 space-y-3">
              <Input name="name" placeholder="Ingredient name" required />
              <div className="grid grid-cols-3 gap-2">
                <Input name="unit" placeholder="Unit (g/ml/pcs)" defaultValue="g" />
                <Input name="quantity" type="number" placeholder="Stock" defaultValue="0" />
                <Input name="minimumLevel" type="number" placeholder="Min stock" defaultValue="0" />
              </div>
              <Input name="unitCost" type="number" step="0.01" placeholder="Cost per unit" defaultValue="0" />
              {ingredientState.error && <p className="text-xs text-red-600">{ingredientState.error}</p>}
              <Button type="submit" disabled={addingIngredient} className="w-full">{addingIngredient ? "Adding..." : "Add ingredient"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => {
          const low = r.quantity <= r.minimum;
          return (
            <div key={r.id} className={`rounded-3xl border bg-white p-5 shadow-soft ${low ? "border-red-300" : "border-beige/50"}`}>
              <div className="flex items-start justify-between gap-2">
                <div><h3 className="font-display text-base font-semibold">{r.ingredient}</h3><p className="text-xs text-muted">Unit: {r.unit}</p></div>
                <Badge tone={low ? "danger" : "success"}>{low ? "Low stock" : "Healthy"}</Badge>
              </div>
              <p className="mt-4 font-display text-2xl font-semibold">{r.quantity.toLocaleString("id-ID")} <span className="text-sm font-normal text-muted">{r.unit}</span></p>
              <p className="mt-1 text-xs text-muted">Min {r.minimum.toLocaleString("id-ID")} · {formatIDR(r.unitCost)}/{r.unit}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => { setSelected(r); setType("PURCHASE"); }}><Plus className="h-3.5 w-3.5" /> Restock</Button>
                <Button size="sm" variant="ghost" onClick={() => { setSelected(r); setType("WASTE"); }}><Minus className="h-3.5 w-3.5" /> Waste</Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent>
          <DialogTitle>Adjust {selected?.ingredient}</DialogTitle>
          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {(["PURCHASE", "ADJUSTMENT", "WASTE", "RETURN"] as const).map((t) => (
                <button key={t} onClick={() => setType(t)} className={`rounded-xl border px-3 py-2 text-xs font-bold ${type === t ? "border-mocha bg-mocha text-warm" : "border-beige/60"}`}>{t.toLowerCase()}</button>
              ))}
            </div>
            <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Quantity" />
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" />
            <Button onClick={adjust} disabled={busy || !qty} className="w-full">{busy ? "Saving..." : "Apply adjustment"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-3xl border border-beige/50 bg-white p-5 shadow-soft">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><History className="h-5 w-5 text-caramel" /> Recent stock movements</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-beige/50 text-[11px] uppercase text-muted"><tr><th className="py-2">Ingredient</th><th>Type</th><th>Qty</th><th>Before → After</th><th>Note</th><th>Date</th></tr></thead>
            <tbody>
              {rows.flatMap((r) => r.movements.map((m) => ({ ...m, ingredient: r.ingredient }))).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20).map((m) => (
                <tr key={m.id} className="border-b border-beige/30 text-xs last:border-0"><td className="py-2 font-semibold">{m.ingredient}</td><td><Badge>{m.type}</Badge></td><td>{m.quantity}</td><td className="text-muted">{m.previousQty} → {m.newQty}</td><td className="text-muted">{m.note ?? "—"}</td><td className="text-muted">{new Date(m.createdAt).toLocaleDateString("id-ID")}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
