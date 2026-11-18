"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Star, ArrowLeft, RotateCcw, ShieldCheck, Clock, Heart } from "lucide-react";
import { cn, formatIDR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { ProductCustomizer } from "@/components/menu/product-customizer";
import type { CatalogProduct } from "@/components/menu/product-card";

const ProductViewer = dynamic(() => import("@/components/three/product-viewer"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-3xl bg-cream" />,
});

type Review = { id: string; rating: number; comment: string | null; createdAt: string; customer: { name: string } | null };

export function ProductDetail({
  product,
  reviews,
  related,
}: {
  product: CatalogProduct;
  reviews: Review[];
  related: CatalogProduct[];
}) {
  const [customize, setCustomize] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [list, setList] = useState(reviews);
  const { status } = useSession();
  const isPastry = product.category.slug === "pastries" || product.category.slug === "desserts";

  const toggleWishlist = async () => {
    if (status !== "authenticated") { toast.error("Sign in to save this cup to your wishlist."); return; }
    try {
      const res = await fetch("/api/account/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save");
      setSaved(json.saved);
      toast.success(json.saved ? "Saved to your wishlist! 💕" : "Removed from your wishlist.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Please try again"); }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not post review");
      setList((prev) => [{ id: data.id, rating, comment, createdAt: new Date().toISOString(), customer: { name: "You" } }, ...prev]);
      setComment("");
      toast.success("Thanks for sharing the love! 💕");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Please try again");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container-artisan py-10">
      <Link href="/menu" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-mocha/70 hover:text-mocha"><ArrowLeft className="h-4 w-4" /> Back to menu</Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative h-[420px] overflow-hidden rounded-[2.5rem] border border-beige/50 bg-gradient-to-br from-cream via-[#F4E3CE] to-beige shadow-soft lg:h-[560px]">
          <ProductViewer
            color={isPastry ? "#D9A05B" : "#FFF9F0"}
            liquid={product.gradient.includes("green") ? "#8BC34A" : product.gradient.includes("pink") ? "#E79A9E" : "#6B3E26"}
            isPastry={isPastry}
          />
          <span className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-warm/85 px-4 py-2 text-xs font-semibold text-mocha backdrop-blur">
            <RotateCcw className="h-3.5 w-3.5" /> Drag to rotate · Scroll to zoom
          </span>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="pink">{product.category.name}</Badge>
            {product.isFeatured && <Badge tone="warning"><Star className="h-3 w-3 fill-current" /> Bestseller</Badge>}
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 font-semibold text-amber-600"><Star className="h-4 w-4 fill-current" /> {product.rating.toFixed(1)}</span>
            <span className="text-muted">{list.length} reviews</span>
            <span className="text-muted">·</span>
            <span className="text-muted">{product.soldCount} sold</span>
          </div>
          <p className="mt-5 text-base leading-relaxed text-muted">{product.description}</p>

          <div className="mt-6 flex items-end gap-3">
            <span className="font-display text-3xl font-semibold text-mocha">{formatIDR(product.price)}</span>
            {product.calories && <span className="mb-1.5 text-xs text-muted">{product.calories} kcal per serving</span>}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => setCustomize(true)} className="flex-1 sm:flex-none">Customize & Add to Basket <Heart className="h-4 w-4" /></Button>
            <Button size="lg" variant="secondary" onClick={toggleWishlist} aria-label="Save to wishlist"><Heart className={cn("h-4 w-4", saved && "fill-pink text-pink")} /></Button>
            <Link href="/cart"><Button size="lg" variant="secondary">Go to basket</Button></Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-cream/60 p-4"><Clock className="h-5 w-5 text-caramel" /><div><p className="text-xs font-bold">Ready in {product.preparationTime} min</p><p className="text-[11px] text-muted">Freshly made to order</p></div></div>
            <div className="flex items-center gap-3 rounded-2xl bg-cream/60 p-4"><ShieldCheck className="h-5 w-5 text-caramel" /><div><p className="text-xs font-bold">Happy guarantee</p><p className="text-[11px] text-muted">Love it or we remake it</p></div></div>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold">What people are saying</h2>
          <div className="mt-5 space-y-3">
            {list.length === 0 && <p className="rounded-2xl bg-cream/50 p-5 text-sm text-muted">No reviews yet — be the first to share the love!</p>}
            {list.map((r) => (
              <div key={r.id} className="rounded-2xl border border-beige/50 bg-white/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{r.customer?.name ?? "Coffee lover"}</span>
                  <span className="flex gap-0.5 text-amber-500">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{r.comment}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold">Leave a little love</h2>
          <form onSubmit={submitReview} className="mt-5 space-y-4 rounded-3xl border border-beige/50 bg-cream/30 p-5">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                  <Star className={`h-7 w-7 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-beige"}`} />
                </button>
              ))}
            </div>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} required minLength={5} maxLength={1000} placeholder="Tell us what you loved..." />
            <Button type="submit" disabled={sending}>{sending ? "Sending..." : "Post review"}</Button>
          </form>
        </section>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold">You might also love</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <Link key={p.id} href={`/menu/${p.slug}`} className="rounded-2xl border border-beige/50 bg-white/70 p-4 transition hover:-translate-y-1 hover:shadow-soft">
                <p className="font-display text-sm font-semibold">{p.name}</p>
                <p className="mt-1 text-xs text-muted">{formatIDR(p.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ProductCustomizer product={product} open={customize} onOpenChange={setCustomize} />
    </div>
  );
}
