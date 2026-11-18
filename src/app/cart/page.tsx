"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { useCart, cartSubtotal } from "@/store/cart-store";
import { formatIDR } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, setQuantity, remove, clear } = useCart();
  const subtotal = cartSubtotal(items);
  const tax = Math.round(subtotal * 0.1);
  const delivery = 10000;

  if (items.length === 0) {
    return (
      <div className="container-artisan flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="text-8xl">🐰</span>
        <h1 className="heading-lg mt-6">Oops! Your Basket Is Feeling Lonely.</h1>
        <p className="mt-3 max-w-md text-muted">Our bunny barista is waiting with a fresh cup. Let's fill that basket with a little happiness!</p>
        <Link href="/menu" className="mt-7"><Button size="lg">Explore Our Menu <ArrowRight className="h-4 w-4" /></Button></Link>
      </div>
    );
  }

  return (
    <div className="container-artisan py-12">
      <div className="mb-8">
        <span className="section-label"><ShoppingBag className="h-3.5 w-3.5" /> Your Basket</span>
        <h1 className="heading-lg mt-2">Your Coffee Buddies Are Waiting!</h1>
        <p className="mt-2 text-muted">Everything looks delicious. Ready for the next step?</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.key} className="flex flex-col gap-4 rounded-3xl border border-beige/50 bg-white/70 p-4 sm:flex-row sm:items-center">
              <div className={`relative h-24 w-full shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br sm:w-28 ${item.gradient}`}>
                {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill sizes="112px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-semibold">{item.name}</h2>
                <p className="mt-1 text-xs text-muted">
                  {item.size.toLowerCase()} · {item.temperature.toLowerCase()} · sugar {item.sugarLevel}% · ice {item.iceLevel}%
                  {item.extraShot && " · extra espresso shot"}
                  {item.extraMilk && " · extra milk"}
                  {item.addons.length > 0 && ` · ${item.addons.join(", ")}`}
                </p>
                {item.note && <p className="mt-1 text-xs italic text-caramel">“{item.note}”</p>}
                <p className="mt-2 font-display text-lg font-semibold text-mocha">{formatIDR(item.unitPrice)}</p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <div className="flex items-center rounded-full border border-beige/60">
                  <button onClick={() => setQuantity(item.key, item.quantity - 1)} className="p-2 hover:bg-cream" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <button onClick={() => setQuantity(item.key, item.quantity + 1)} className="p-2 hover:bg-cream" aria-label="Increase"><Plus className="h-4 w-4" /></button>
                </div>
                <button onClick={() => remove(item.key)} className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
              </div>
            </div>
          ))}
          <button onClick={clear} className="text-xs font-semibold text-mocha/60 underline">Clear basket</button>
        </div>

        <aside className="h-fit rounded-3xl border border-beige/50 bg-cream/40 p-6 shadow-soft lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-semibold">Order Summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="font-semibold">{formatIDR(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Tax (10%)</span><span className="font-semibold">{formatIDR(tax)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Delivery (if applicable)</span><span className="font-semibold">{formatIDR(delivery)}</span></div>
            <div className="border-t border-beige/50 pt-3 font-display text-xl font-semibold"><div className="flex justify-between"><span>Total</span><span className="text-mocha">{formatIDR(subtotal + tax + delivery)}</span></div></div>
          </div>
          <Link href="/checkout" className="mt-6 block"><Button className="w-full" size="lg">Almost There, Coffee Lover! <ArrowRight className="h-4 w-4" /></Button></Link>
          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-white/70 p-3 text-xs text-muted">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-caramel" /> Delivery fee only applies to delivery orders. Final total is calculated at checkout.
          </div>
        </aside>
      </div>
    </div>
  );
}
