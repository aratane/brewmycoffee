"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/misc";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatIDR, cn } from "@/lib/utils";
import { useCart } from "@/store/cart-store";
import type { CatalogProduct } from "@/components/menu/product-card";
import type { ProductSize, Temperature } from "@prisma/client";

const ProductViewer = dynamic(() => import("@/components/three/product-viewer"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-cream" />,
});

const SIZE_ADJUST: Record<ProductSize, number> = { SMALL: -4000, MEDIUM: 0, LARGE: 6000 };

export function ProductCustomizer({
  product,
  open,
  onOpenChange,
}: {
  product: CatalogProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [size, setSize] = useState<ProductSize>("MEDIUM");
  const [temperature, setTemperature] = useState<Temperature>("HOT");
  const [sugar, setSugar] = useState(100);
  const [ice, setIce] = useState(100);
  const [extraShot, setExtraShot] = useState(false);
  const [extraMilk, setExtraMilk] = useState(false);
  const [addons, setAddons] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const add = useCart((s) => s.add);

  const isPastry = product.category.slug === "pastries" || product.category.slug === "desserts";
  const addonTotal = product.addons.filter((a) => addons.includes(a.name)).reduce((sum, a) => sum + Number(a.price), 0);
  const unit = Math.max(1000, product.price + SIZE_ADJUST[size] + (extraShot ? 8000 : 0) + (extraMilk ? 5000 : 0) + addonTotal);

  const submit = () => {
    add({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      gradient: product.gradient,
      basePrice: product.price,
      quantity: qty,
      size,
      temperature,
      sugarLevel: sugar,
      iceLevel: ice,
      extraShot,
      extraMilk,
      addons,
      note: note || undefined,
      unitPrice: unit,
    });
    toast.success(`${product.name} joined your basket!`, { description: "Your coffee buddy is waiting. 🐰" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 sm:p-0">
        <div className="grid max-h-[90vh] overflow-y-auto md:grid-cols-2">
          <div className="relative h-56 bg-gradient-to-br from-cream via-[#F3E2CC] to-beige md:h-auto md:min-h-[420px]">
            <ProductViewer
              color={isPastry ? "#D9A05B" : "#FFF9F0"}
              liquid={product.gradient.includes("green") ? "#8BC34A" : product.gradient.includes("pink") ? "#E79A9E" : "#6B3E26"}
              isPastry={isPastry}
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-warm/85 px-3 py-1 text-[10px] font-bold text-mocha backdrop-blur">
              Drag to rotate · Scroll to zoom
            </span>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <Badge tone="pink">{product.category.name}</Badge>
              <DialogTitle className="mt-2 text-2xl">{product.name}</DialogTitle>
              <DialogDescription className="mt-1.5">{product.description}</DialogDescription>
            </div>

            {!isPastry && (
              <>
                <div>
                  <Label className="mb-2 block">Size</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["SMALL", "MEDIUM", "LARGE"] as ProductSize[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={cn(
                          "rounded-xl border px-2 py-2 text-xs font-bold transition",
                          size === s ? "border-mocha bg-mocha text-warm" : "border-beige/60 bg-warm text-mocha hover:border-caramel"
                        )}
                      >
                        {s.toLowerCase()}
                        <span className="mt-0.5 block text-[9px] font-medium opacity-70">
                          {SIZE_ADJUST[s] === 0 ? "—" : `${SIZE_ADJUST[s] > 0 ? "+" : "-"}${formatIDR(Math.abs(SIZE_ADJUST[s]))}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Temperature</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["HOT", "ICED"] as Temperature[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTemperature(t)}
                        className={cn(
                          "rounded-xl border py-2 text-xs font-bold transition",
                          temperature === t ? "border-mocha bg-mocha text-warm" : "border-beige/60 bg-warm text-mocha"
                        )}
                      >
                        {t === "HOT" ? "☕ Hot" : "🧊 Iced"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="mb-2 flex justify-between"><Label>Sugar</Label><span className="text-xs text-muted">{sugar}%</span></div>
                    <input type="range" min={0} max={200} step={25} value={sugar} onChange={(e) => setSugar(Number(e.target.value))} className="w-full accent-[#A97850]" />
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between"><Label>Ice</Label><span className="text-xs text-muted">{ice}%</span></div>
                    <input type="range" min={0} max={200} step={25} value={ice} onChange={(e) => setIce(Number(e.target.value))} className="w-full accent-[#A97850]" />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Little extras</Label>
                  <div className="flex flex-wrap gap-2">
                    <Toggle active={extraShot} onClick={() => setExtraShot(!extraShot)}>Extra shot +{formatIDR(8000)}</Toggle>
                    <Toggle active={extraMilk} onClick={() => setExtraMilk(!extraMilk)}>Extra milk +{formatIDR(5000)}</Toggle>
                  </div>
                </div>

                {product.addons.length > 0 && (
                  <div>
                    <Label className="mb-2 block">Toppings</Label>
                    <div className="flex flex-wrap gap-2">
                      {product.addons.map((a) => (
                        <Toggle
                          key={a.id}
                          active={addons.includes(a.name)}
                          onClick={() => setAddons((prev) => prev.includes(a.name) ? prev.filter((n) => n !== a.name) : [...prev, a.name])}
                        >
                          {a.name} +{formatIDR(Number(a.price))}
                        </Toggle>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <Label htmlFor="note" className="mb-1.5 block">Special request <span className="font-normal text-muted">(optional)</span></Label>
              <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. extra hot, no straw..." maxLength={200} />
            </div>

            <div className="flex items-center gap-3 border-t border-beige/40 pt-4">
              <div className="flex items-center gap-1 rounded-full border border-beige/60 p-1">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-cream" aria-label="Decrease quantity"><Minus className="h-3.5 w-3.5" /></button>
                <span className="w-6 text-center text-sm font-bold">{qty}</span>
                <button onClick={() => setQty(Math.min(99, qty + 1))} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-cream" aria-label="Increase quantity"><Plus className="h-3.5 w-3.5" /></button>
              </div>
              <Button className="flex-1" onClick={submit}>
                <ShoppingBag className="h-4 w-4" /> Add · {formatIDR(unit * qty)}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
        active ? "border-caramel bg-caramel/10 text-mocha" : "border-beige/60 bg-warm text-mocha/70 hover:border-caramel"
      )}
    >
      {children}
    </button>
  );
}
