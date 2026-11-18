"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { UtensilsCrossed, ShoppingBag, Truck, CreditCard, Landmark, Banknote, Tag, Check, ArrowRight, PartyPopper } from "lucide-react";
import { checkoutSchema } from "@/lib/validations";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label, Switch } from "@/components/ui/misc";
import { cn, formatIDR } from "@/lib/utils";
import { useCart, cartSubtotal } from "@/store/cart-store";
import { BANKS } from "@/lib/constants";

type FormValues = z.infer<typeof checkoutSchema>;

export function CheckoutForm() {
  const router = useRouter();
  const { items, clear } = useCart();
  const { data: session } = useSession();
  const [voucher, setVoucher] = useState("");
  const [discount, setDiscount] = useState(0);
  const [voucherError, setVoucherError] = useState("");
  const [checkingVoucher, setCheckingVoucher] = useState(false);
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { type: "TAKEAWAY", paymentMethod: "QRIS", useLoyalty: false },
  });

  const type = watch("type");
  const paymentMethod = watch("paymentMethod");
  const bank = watch("bank");
  const subtotal = cartSubtotal(items);
  const tax = Math.round((subtotal - discount) * 0.1);
  const delivery = type === "DELIVERY" ? 10000 : 0;
  const loyaltyDiscount = useLoyalty && loyaltyPoints ? Math.min(loyaltyPoints, Math.floor((subtotal - discount) / 1000)) * 1000 : 0;
  const total = Math.max(0, subtotal - discount - loyaltyDiscount + tax + delivery);

  // Load loyalty balance for signed-in customers.
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/account/loyalty")
      .then((r) => r.json())
      .then((d) => { if (typeof d.points === "number") setLoyaltyPoints(d.points); })
      .catch(() => {});
  }, [session?.user?.id]);

  const checkVoucher = async () => {
    if (!voucher.trim()) return;
    setCheckingVoucher(true);
    setVoucherError("");
    try {
      const res = await fetch(`/api/vouchers/check?code=${encodeURIComponent(voucher)}&subtotal=${subtotal}`);
      const data = await res.json();
      if (!res.ok) { setVoucherError(data.error ?? "Invalid voucher"); setDiscount(0); }
      else { setDiscount(data.discount); toast.success(`Voucher applied! You saved ${formatIDR(data.discount)} 🎉`); }
    } catch { setVoucherError("Could not check voucher right now."); }
    finally { setCheckingVoucher(false); }
  };

  const onSubmit = async (data: FormValues) => {
    if (items.length === 0) { toast.error("Your basket is empty!"); return; }
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          customerEmail: data.customerEmail || "",
          voucherCode: voucher || undefined,
          useLoyalty,
          items: items.map((i) => ({
            productId: i.productId, quantity: i.quantity, size: i.size, temperature: i.temperature,
            sugarLevel: i.sugarLevel, iceLevel: i.iceLevel, extraShot: i.extraShot, extraMilk: i.extraMilk,
            addons: i.addons, note: i.note,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not place your order");
      clear();
      toast.success("Order placed! Let's complete your payment. 🎉");
      router.push(`/payment/${json.orderNumber}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-artisan flex min-h-[50vh] flex-col items-center justify-center text-center">
        <span className="text-7xl">🛒</span>
        <h1 className="mt-5 font-display text-2xl font-semibold">Your basket is empty!</h1>
        <p className="mt-2 text-muted">Let's add something yummy before checking out.</p>
        <Link href="/menu" className="mt-5"><Button>Browse the menu</Button></Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="container-artisan grid gap-8 py-12 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-beige/50 bg-white/70 p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold">1. Your details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={errors.customerName?.message}>
              <Input {...register("customerName")} placeholder="e.g. Cindy Coffee" className={cn(errors.customerName && "border-red-400")} />
            </Field>
            <Field label="WhatsApp number" error={errors.customerPhone?.message}>
              <Input {...register("customerPhone")} placeholder="0812-3456-7890" className={cn(errors.customerPhone && "border-red-400")} />
            </Field>
            <Field label="Email (optional)" error={errors.customerEmail?.message}>
              <Input {...register("customerEmail")} type="email" placeholder="you@example.com" />
            </Field>
            <Field label="Order type">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "DINE_IN", label: "Dine-in", icon: UtensilsCrossed },
                  { value: "TAKEAWAY", label: "Takeaway", icon: ShoppingBag },
                  { value: "DELIVERY", label: "Delivery", icon: Truck },
                ].map(({ value, label, icon: Icon }) => (
                  <button type="button" key={value} onClick={() => setValue("type", value as FormValues["type"])} className={cn("flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-xs font-bold transition", type === value ? "border-mocha bg-mocha text-warm" : "border-beige/60 bg-warm text-mocha")}>
                    <Icon className="h-5 w-5" /> {label}
                  </button>
                ))}
              </div>
            </Field>
            {type === "DINE_IN" && (
              <Field label="Table number">
                <Input {...register("tableNumber")} placeholder="e.g. 05" />
              </Field>
            )}
            <div className="sm:col-span-2">
              <Field label="Additional notes (optional)">
                <Textarea {...register("notes")} placeholder="Extra hot, no straw, leave at the door..." maxLength={500} />
              </Field>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-beige/50 bg-white/70 p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold">2. Payment method</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { value: "QRIS", label: "QRIS", desc: "Scan & pay", icon: CreditCard },
              { value: "BANK_TRANSFER", label: "Bank Transfer", desc: "VA / manual", icon: Landmark },
              { value: "CASH", label: "Cash", desc: "Pay at counter", icon: Banknote },
            ].map(({ value, label, desc, icon: Icon }) => (
              <button type="button" key={value} onClick={() => setValue("paymentMethod", value as FormValues["paymentMethod"])} className={cn("flex items-center gap-3 rounded-2xl border p-4 text-left transition", paymentMethod === value ? "border-mocha bg-cream/60 ring-2 ring-mocha/10" : "border-beige/60 bg-warm hover:border-caramel")}>
                <Icon className="h-5 w-5 text-caramel" />
                <span><span className="block text-sm font-bold">{label}</span><span className="block text-[11px] text-muted">{desc}</span></span>
              </button>
            ))}
          </div>
          {paymentMethod === "BANK_TRANSFER" && (
            <div className="mt-4">
              <Label className="mb-2 block">Choose a bank</Label>
              <div className="flex flex-wrap gap-2">
                {BANKS.map((b) => (
                  <button type="button" key={b.code} onClick={() => setValue("bank", b.code)} className={cn("rounded-full border px-4 py-2 text-xs font-bold", bank === b.code ? "border-mocha bg-mocha text-warm" : "border-beige/60 bg-warm text-mocha")}>{b.name}</button>
                ))}
              </div>
              {!bank && <p className="mt-2 text-xs text-amber-700">Please pick a bank to continue.</p>}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-beige/50 bg-white/70 p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold">3. Little extras</h2>
          <div className="mt-5 flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <Label className="mb-1.5 block">Voucher code</Label>
              <div className="flex gap-2">
                <Input value={voucher} onChange={(e) => { setVoucher(e.target.value.toUpperCase()); setVoucherError(""); }} placeholder="HAPPY10" />
                <Button type="button" variant="secondary" onClick={checkVoucher} disabled={checkingVoucher}>{checkingVoucher ? "..." : "Apply"}</Button>
              </div>
              {voucherError && <p className="mt-1 text-xs text-red-600">{voucherError}</p>}
              {discount > 0 && <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-700"><Check className="h-3 w-3" /> Voucher applied!</p>}
            </div>
            {session && loyaltyPoints !== null && (
              <div className="flex items-center gap-3 rounded-2xl bg-cream/60 p-3">
                <Switch checked={useLoyalty} onCheckedChange={setUseLoyalty} />
                <span className="text-xs font-semibold">Use {loyaltyPoints} loyalty points<br /><span className="font-normal text-muted">1 point = Rp1.000 off</span></span>
              </div>
            )}
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-3xl border border-beige/50 bg-cream/40 p-6 shadow-soft lg:sticky lg:top-24">
        <h2 className="font-display text-xl font-semibold">Almost There, Coffee Lover!</h2>
        <p className="mt-1 text-xs text-muted">{items.reduce((s, i) => s + i.quantity, 0)} happy cups in your basket</p>
        <div className="mt-5 space-y-2.5 text-sm">
          <Row label="Subtotal" value={formatIDR(subtotal)} />
          {discount > 0 && <Row label="Voucher discount" value={`- ${formatIDR(discount)}`} accent />}
          {loyaltyDiscount > 0 && <Row label="Loyalty points" value={`- ${formatIDR(loyaltyDiscount)}`} accent />}
          <Row label="Tax (10%)" value={formatIDR(tax)} />
          {delivery > 0 && <Row label="Delivery" value={formatIDR(delivery)} />}
          <div className="flex justify-between border-t border-beige/50 pt-3 font-display text-xl font-semibold"><span>Total</span><span className="text-mocha">{formatIDR(total)}</span></div>
        </div>
        <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting || (paymentMethod === "BANK_TRANSFER" && !bank)}>
          {isSubmitting ? "Placing your order..." : "Place My Order"} <PartyPopper className="h-4 w-4" />
        </Button>
        <p className="mt-3 text-center text-[11px] text-muted">You'll be taken to the payment page next. No charge until you pay. 🔒</p>
      </aside>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div><Label className="mb-1.5 block">{label}</Label>{children}{error && <p className="mt-1 text-xs text-red-600">{error}</p>}</div>;
}
function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return <div className="flex justify-between"><span className="text-muted">{label}</span><span className={cn("font-semibold", accent && "text-emerald-700")}>{value}</span></div>;
}
