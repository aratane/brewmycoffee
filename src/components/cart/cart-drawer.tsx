"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, X } from "lucide-react";
import { useCart, cartSubtotal } from "@/store/cart-store";
import { formatIDR } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const { items, isOpen, close, setQuantity, remove } = useCart();
  const subtotal = cartSubtotal(items);
  const tax = Math.round(subtotal * 0.1);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-mocha/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-warm shadow-float"
          >
            <div className="flex items-center justify-between border-b border-beige/40 px-6 py-5">
              <div>
                <h2 className="font-display text-xl font-semibold">Your Coffee Buddies</h2>
                <p className="text-xs text-muted">Your basket is waiting for you! 🐰</p>
              </div>
              <button onClick={close} aria-label="Close cart" className="rounded-full p-2 text-mocha hover:bg-cream"><X className="h-5 w-5" /></button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <span className="text-7xl">🐰</span>
                <h3 className="font-display text-xl font-semibold">Oops! Your basket is feeling lonely.</h3>
                <p className="text-sm text-muted">Let's find you a happy cup. Buni recommends the Bunny Signature Latte!</p>
                <Link href="/menu" onClick={close}><Button>Find my happy cup <ArrowRight className="h-4 w-4" /></Button></Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
                  {items.map((item) => (
                    <div key={item.key} className="flex gap-3 rounded-2xl border border-beige/50 bg-white/70 p-3">
                      <div className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${item.gradient}`}>
                        {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{item.name}</p>
                        <p className="mt-0.5 text-[11px] text-muted">
                          {item.size.toLowerCase()} · {item.temperature.toLowerCase()} · sugar {item.sugarLevel}%
                          {item.extraShot && " · extra shot"}
                        </p>
                        <p className="mt-1 text-sm font-bold text-mocha">{formatIDR(item.unitPrice * item.quantity)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center rounded-full border border-beige/60">
                            <button onClick={() => setQuantity(item.key, item.quantity - 1)} className="p-1.5 hover:bg-cream" aria-label="Decrease"><Minus className="h-3 w-3" /></button>
                            <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                            <button onClick={() => setQuantity(item.key, item.quantity + 1)} className="p-1.5 hover:bg-cream" aria-label="Increase"><Plus className="h-3 w-3" /></button>
                          </div>
                          <button onClick={() => remove(item.key)} className="p-1.5 text-red-500 hover:bg-red-50" aria-label="Remove item"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 border-t border-beige/40 bg-cream/30 p-6">
                  <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span className="font-semibold">{formatIDR(subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted">Tax (10%)</span><span className="font-semibold">{formatIDR(tax)}</span></div>
                  <div className="flex justify-between border-t border-beige/40 pt-3 font-display text-lg font-semibold"><span>Total</span><span className="text-mocha">{formatIDR(subtotal + tax)}</span></div>
                  <Link href="/checkout" onClick={close} className="block"><Button className="w-full">Checkout <ArrowRight className="h-4 w-4" /></Button></Link>
                  <Link href="/cart" onClick={close} className="block text-center text-xs font-semibold text-mocha/70 underline">View full cart</Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
