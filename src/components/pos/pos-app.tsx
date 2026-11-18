"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Plus, Minus, Trash2, ScanLine, UtensilsCrossed, ShoppingBag, Banknote, CreditCard, Landmark, Printer, CheckCircle2, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn, formatIDR } from "@/lib/utils";
import { Receipt, type ReceiptData } from "@/components/pos/receipt";
import { QRCodeSVG } from "qrcode.react";
import type { ProductSize, Temperature } from "@prisma/client";

export type PosProduct = {
  id: string; name: string; sku: string; barcode: string | null; price: number;
  imageUrl: string | null; gradient: string; categoryId: string; category: string;
  addons: Array<{ name: string; price: number }>;
};

type CartLine = {
  key: string; productId: string; name: string; unitPrice: number; quantity: number;
  size: ProductSize; temperature: Temperature; addons: string[]; extraShot: boolean; extraMilk: boolean;
};

const SIZE_ADJUST: Record<ProductSize, number> = { SMALL: -4000, MEDIUM: 0, LARGE: 6000 };

export function PosApp({ products, categories, tables, cashier }: {
  products: PosProduct[];
  categories: Array<{ id: string; name: string }>;
  tables: Array<{ number: string; status: string }>;
  cashier: string;
}) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customizing, setCustomizing] = useState<PosProduct | null>(null);
  const [size, setSize] = useState<ProductSize>("MEDIUM");
  const [temp, setTemp] = useState<Temperature>("HOT");
  const [addons, setAddons] = useState<string[]>([]);
  const [extraShot, setExtraShot] = useState(false);
  const [extraMilk, setExtraMilk] = useState(false);
  const [qty, setQty] = useState(1);

  const [customerName, setCustomerName] = useState("Walk-in Guest");
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY">("TAKEAWAY");
  const [tableNumber, setTableNumber] = useState("");
  const [discount, setDiscount] = useState(0);
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [serviceCharge, setServiceCharge] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS" | "BANK_TRANSFER">("CASH");
  const [bank, setBank] = useState("bca");
  const [tendered, setTendered] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ receipt: ReceiptData; payment: { kind?: string; qrString?: string; message?: string } | null; completed: boolean; orderNumber: string; change: number } | null>(null);

  const shown = useMemo(() => products.filter((p) =>
    (category === "all" || p.categoryId === category) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
  ), [products, category, search]);

  const addToCart = (product: PosProduct, opts?: { size: ProductSize; temp: Temperature; addons: string[]; extraShot: boolean; extraMilk: boolean; qty: number }) => {
    const o = opts ?? { size: "MEDIUM" as ProductSize, temp: "HOT" as Temperature, addons: [], extraShot: false, extraMilk: false, qty: 1 };
    const price = Math.max(1000, product.price + SIZE_ADJUST[o.size] + (o.extraShot ? 8000 : 0) + (o.extraMilk ? 5000 : 0) + o.addons.reduce((s, n) => s + (product.addons.find((a) => a.name === n)?.price ?? 0), 0));
    const key = [product.id, o.size, o.temp, o.addons.join(","), o.extraShot, o.extraMilk].join("|");
    setCart((prev) => {
      const found = prev.find((l) => l.key === key);
      if (found) return prev.map((l) => l.key === key ? { ...l, quantity: l.quantity + o.qty } : l);
      return [...prev, { key, productId: product.id, name: product.name, unitPrice: price, quantity: o.qty, size: o.size, temperature: o.temp, addons: o.addons, extraShot: o.extraShot, extraMilk: o.extraMilk }];
    });
    toast.success(`${product.name} added to sale`);
  };

  const scan = () => {
    const found = products.find((p) => p.sku.toLowerCase() === barcode.trim().toLowerCase() || p.barcode === barcode.trim());
    if (!found) { toast.error("No product matches that SKU or barcode."); return; }
    addToCart(found);
    setBarcode("");
  };

  const setQtyFor = (key: string, delta: number) => setCart((prev) => prev.map((l) => l.key === key ? { ...l, quantity: l.quantity + delta } : l).filter((l) => l.quantity > 0));

  const subtotal = cart.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const afterDiscount = Math.max(0, subtotal - discount);
  const tax = taxEnabled ? Math.round(afterDiscount * 0.1) : 0;
  const service = serviceCharge ? Math.round(afterDiscount * 0.05) : 0;
  const total = afterDiscount + tax + service;
  const change = Math.max(0, Number(tendered || 0) - total);

  const checkout = async () => {
    if (!cart.length) { toast.error("Add something to the sale first."); return; }
    if (orderType === "DINE_IN" && !tableNumber) { toast.error("Please choose a table."); return; }
    if (paymentMethod === "CASH" && Number(tendered || 0) < total) { toast.error("Cash tendered is less than the total."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/pos/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity, size: l.size, temperature: l.temperature, sugarLevel: 100, iceLevel: 100, extraShot: l.extraShot, extraMilk: l.extraMilk, addons: l.addons })),
          customerName, orderType, tableNumber: orderType === "DINE_IN" ? tableNumber : undefined,
          discount, taxEnabled, serviceChargeRate: serviceCharge ? 0.05 : 0,
          paymentMethod, amountTendered: paymentMethod === "CASH" ? Number(tendered) : undefined, bank,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not complete sale");
      setResult({ receipt: json.receipt, payment: json.payment, completed: json.completed, orderNumber: json.orderNumber, change: json.change });
      setCart([]); setDiscount(0); setTendered("");
      toast.success(json.completed ? "Sale complete! 💰" : "Order saved — awaiting payment.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Please try again"); }
    finally { setBusy(false); }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <div className="rounded-3xl border border-beige/50 bg-white p-4 shadow-soft">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mocha/50" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="pl-9" /></div>
            <div className="flex gap-2"><Input value={barcode} onChange={(e) => setBarcode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && scan()} placeholder="SKU / barcode + Enter" className="w-48" /><Button variant="secondary" onClick={scan} aria-label="Scan"><ScanLine className="h-4 w-4" /></Button></div>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <CategoryPill active={category === "all"} onClick={() => setCategory("all")}>All</CategoryPill>
            {categories.map((c) => <CategoryPill key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>{c.name}</CategoryPill>)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {shown.map((p) => (
            <button key={p.id} onClick={() => { setCustomizing(p); setSize("MEDIUM"); setTemp("HOT"); setAddons([]); setExtraShot(false); setExtraMilk(false); setQty(1); }} className="group rounded-2xl border border-beige/50 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-caramel hover:shadow-soft">
              <div className={cn("mb-2 flex h-20 items-center justify-center rounded-xl bg-gradient-to-br text-2xl", p.gradient)}>☕</div>
              <p className="line-clamp-2 text-xs font-bold leading-tight">{p.name}</p>
              <p className="mt-1 text-xs font-semibold text-mocha">{formatIDR(p.price)}</p>
              <span className="mt-2 flex items-center justify-center gap-1 rounded-lg bg-cream py-1 text-[10px] font-bold text-mocha"><Plus className="h-3 w-3" /> Add</span>
            </button>
          ))}
        </div>
      </div>

      <aside className="h-fit rounded-3xl border border-beige/50 bg-white p-5 shadow-soft xl:sticky xl:top-4">
        <div className="flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Current sale</h2><Badge tone="pink">{cart.reduce((s, l) => s + l.quantity, 0)} items</Badge></div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => setOrderType("TAKEAWAY")} className={cn("flex items-center justify-center gap-2 rounded-xl border py-2 text-xs font-bold", orderType === "TAKEAWAY" ? "border-mocha bg-mocha text-warm" : "border-beige/60")}><ShoppingBag className="h-4 w-4" /> Takeaway</button>
          <button onClick={() => setOrderType("DINE_IN")} className={cn("flex items-center justify-center gap-2 rounded-xl border py-2 text-xs font-bold", orderType === "DINE_IN" ? "border-mocha bg-mocha text-warm" : "border-beige/60")}><UtensilsCrossed className="h-4 w-4" /> Dine-in</button>
        </div>
        <div className="mt-3 space-y-2">
          <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" className="h-9" />
          {orderType === "DINE_IN" && <select value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className="input-artisan h-9 text-xs"><option value="">Select table...</option>{tables.filter((t) => t.status === "AVAILABLE").map((t) => <option key={t.number} value={t.number}>Table {t.number}</option>)}</select>}
        </div>

        <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {cart.length === 0 && <p className="rounded-xl bg-cream/50 p-4 text-center text-xs text-muted">Tap a product to start a sale.</p>}
          {cart.map((l) => (
            <div key={l.key} className="rounded-xl border border-beige/50 p-2.5">
              <div className="flex justify-between gap-2"><span className="text-xs font-bold">{l.name}</span><span className="text-xs font-bold">{formatIDR(l.unitPrice * l.quantity)}</span></div>
              <p className="text-[10px] text-muted">{l.size.toLowerCase()} · {l.temperature.toLowerCase()}{l.addons.length ? ` · ${l.addons.join(", ")}` : ""}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center rounded-full border border-beige/60"><button onClick={() => setQtyFor(l.key, -1)} className="p-1.5" aria-label="Decrease"><Minus className="h-3 w-3" /></button><span className="w-5 text-center text-xs font-bold">{l.quantity}</span><button onClick={() => setQtyFor(l.key, 1)} className="p-1.5" aria-label="Increase"><Plus className="h-3 w-3" /></button></div>
                <button onClick={() => setCart((prev) => prev.filter((x) => x.key !== l.key))} className="text-red-500" aria-label="Remove"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 border-t border-beige/40 pt-4">
          <div className="flex items-center gap-2"><Input type="number" value={discount} onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))} placeholder="Discount" className="h-9" /><span className="text-xs text-muted">IDR</span></div>
          <div className="flex gap-4 text-xs font-semibold"><label className="flex items-center gap-1.5"><input type="checkbox" checked={taxEnabled} onChange={(e) => setTaxEnabled(e.target.checked)} /> Tax 10%</label><label className="flex items-center gap-1.5"><input type="checkbox" checked={serviceCharge} onChange={(e) => setServiceCharge(e.target.checked)} /> Service 5%</label></div>
          <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span>{formatIDR(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-sm text-emerald-700"><span>Discount</span><span>-{formatIDR(discount)}</span></div>}
          <div className="flex justify-between text-sm"><span className="text-muted">Tax + service</span><span>{formatIDR(tax + service)}</span></div>
          <div className="flex justify-between border-t border-beige/40 pt-2 font-display text-xl font-semibold"><span>Total</span><span className="text-mocha">{formatIDR(total)}</span></div>
        </div>

        <div className="mt-4">
          <div className="grid grid-cols-3 gap-2">
            {([{ v: "CASH", label: "Cash", icon: Banknote }, { v: "QRIS", label: "QRIS", icon: CreditCard }, { v: "BANK_TRANSFER", label: "Transfer", icon: Landmark }] as const).map(({ v, label, icon: Icon }) => (
              <button key={v} onClick={() => setPaymentMethod(v)} className={cn("flex flex-col items-center gap-1 rounded-xl border py-2 text-[10px] font-bold", paymentMethod === v ? "border-mocha bg-mocha text-warm" : "border-beige/60")}><Icon className="h-4 w-4" /> {label}</button>
            ))}
          </div>
          {paymentMethod === "CASH" && (
            <div className="mt-3"><Input type="number" value={tendered} onChange={(e) => setTendered(e.target.value)} placeholder="Cash tendered" className="h-10" /><p className="mt-1 text-xs font-bold text-emerald-700">Change: {formatIDR(change)}</p></div>
          )}
          {paymentMethod === "BANK_TRANSFER" && (
            <div className="mt-3"><select value={bank} onChange={(e) => setBank(e.target.value)} className="input-artisan h-10 text-xs"><option value="bca">BCA</option><option value="bni">BNI</option><option value="bri">BRI</option><option value="mandiri">Mandiri</option><option value="permata">Permata</option></select></div>
          )}
          {paymentMethod === "QRIS" && <p className="mt-3 text-xs text-muted">A real QRIS QR will be generated by the payment gateway. Configure Midtrans in .env.</p>}
        </div>

        <Button className="mt-4 w-full" size="lg" onClick={checkout} disabled={busy || !cart.length}>
          <CheckCircle2 className="h-4 w-4" /> {busy ? "Processing..." : `Complete sale · ${formatIDR(total)}`}
        </Button>
        <p className="mt-2 text-center text-[10px] text-muted">Cashier: {cashier}</p>
      </aside>

      <Dialog open={!!customizing} onOpenChange={(v) => !v && setCustomizing(null)}>
        <DialogContent>
          <DialogTitle>{customizing?.name}</DialogTitle>
          {customizing && (
            <div className="mt-5 space-y-4">
              <div><p className="mb-2 text-xs font-bold">Size</p><div className="grid grid-cols-3 gap-2">{(["SMALL", "MEDIUM", "LARGE"] as ProductSize[]).map((s) => <button key={s} onClick={() => setSize(s)} className={cn("rounded-xl border py-2 text-xs font-bold", size === s ? "border-mocha bg-mocha text-warm" : "border-beige/60")}>{s.toLowerCase()}</button>)}</div></div>
              <div><p className="mb-2 text-xs font-bold">Temperature</p><div className="grid grid-cols-2 gap-2">{(["HOT", "ICED"] as Temperature[]).map((t) => <button key={t} onClick={() => setTemp(t)} className={cn("rounded-xl border py-2 text-xs font-bold", temp === t ? "border-mocha bg-mocha text-warm" : "border-beige/60")}>{t}</button>)}</div></div>
              {customizing.addons.length > 0 && <div><p className="mb-2 text-xs font-bold">Add-ons</p><div className="flex flex-wrap gap-2">{customizing.addons.map((a) => <button key={a.name} onClick={() => setAddons((p) => p.includes(a.name) ? p.filter((n) => n !== a.name) : [...p, a.name])} className={cn("rounded-full border px-3 py-1.5 text-[11px] font-bold", addons.includes(a.name) ? "border-caramel bg-caramel/10" : "border-beige/60")}>+{a.name} {formatIDR(a.price)}</button>)}</div></div>}
              <div className="flex gap-4 text-xs font-semibold"><label className="flex items-center gap-1.5"><input type="checkbox" checked={extraShot} onChange={(e) => setExtraShot(e.target.checked)} /> Extra shot +8rb</label><label className="flex items-center gap-1.5"><input type="checkbox" checked={extraMilk} onChange={(e) => setExtraMilk(e.target.checked)} /> Extra milk +5rb</label></div>
              <div className="flex items-center gap-3"><div className="flex items-center rounded-full border"><button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2"><Minus className="h-3 w-3" /></button><span className="w-8 text-center text-sm font-bold">{qty}</span><button onClick={() => setQty(qty + 1)} className="p-2"><Plus className="h-3 w-3" /></button></div><Button className="flex-1" onClick={() => { addToCart(customizing, { size, temp, addons, extraShot, extraMilk, qty }); setCustomizing(null); }}>Add to sale</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!result} onOpenChange={(v) => !v && setResult(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" /> {result?.completed ? "Sale complete!" : "Order saved"}</DialogTitle>
          {result && (
            <div className="mt-4 max-h-[70vh] overflow-y-auto">
              {result.payment?.kind === "gateway" && !!result.payment.qrString && (
                <div className="mb-4 flex flex-col items-center rounded-2xl bg-cream/50 p-4"><QRCodeSVG value={result.payment.qrString} size={180} /><p className="mt-2 text-xs font-bold">Scan to pay · {result.orderNumber}</p></div>
              )}
              {result.payment?.kind === "unconfigured" && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{result.payment.message}</p>}
              {result.receipt && <Receipt data={result.receipt} />}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategoryPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition", active ? "border-mocha bg-mocha text-warm" : "border-beige/60 bg-white text-mocha")}>{children}</button>;
}
