"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight, Clock, MapPin, Phone, Sparkles, Heart, Croissant, Coffee, Leaf, Candy, CupSoda, CakeSlice, Percent, Gift, Users, Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard, type CatalogProduct } from "@/components/menu/product-card";

const BunnyScene = dynamic(() => import("@/components/three/bunny-scene"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-3xl bg-cream" />,
});

const CATEGORIES = [
  { name: "Signature Coffee", slug: "signature-coffee", icon: Sparkles, color: "from-amber-200 to-orange-300" },
  { name: "Espresso", slug: "espresso", icon: Coffee, color: "from-stone-300 to-amber-500" },
  { name: "Latte", slug: "latte", icon: CupSoda, color: "from-amber-100 to-amber-300" },
  { name: "Cappuccino", slug: "cappuccino", icon: Coffee, color: "from-orange-100 to-amber-300" },
  { name: "Matcha", slug: "matcha", icon: Leaf, color: "from-lime-200 to-emerald-300" },
  { name: "Chocolate", slug: "chocolate", icon: Candy, color: "from-amber-300 to-stone-400" },
  { name: "Non-Coffee", slug: "non-coffee", icon: CupSoda, color: "from-yellow-100 to-orange-200" },
  { name: "Tea", slug: "tea", icon: Leaf, color: "from-emerald-100 to-teal-200" },
  { name: "Pastries", slug: "pastries", icon: Croissant, color: "from-amber-200 to-yellow-300" },
  { name: "Desserts", slug: "desserts", icon: CakeSlice, color: "from-pink-200 to-rose-300" },
];

export function BestSellers({ products }: { products: CatalogProduct[] }) {
  return (
    <section className="container-artisan py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="section-label"><Sparkles className="h-3.5 w-3.5" /> Crowd Favourites</span>
          <h2 className="heading-lg mt-2">Best Sellers <span className="text-caramel">(*wags tail*)</span></h2>
          <p className="mt-2 text-muted">The cups our regulars keep coming back for.</p>
        </div>
        <Link href="/menu"><Button variant="secondary"><ArrowRight className="h-4 w-4" /> See the whole menu</Button></Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
}

export function CategoryStrip() {
  return (
    <section className="relative overflow-hidden bg-cream/60 py-20">
      <div className="container-artisan">
        <div className="mb-10 text-center">
          <span className="section-label"><Coffee className="h-3.5 w-3.5" /> Our Signature Menu</span>
          <h2 className="heading-lg">Find Your Happy Cup</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">Ten little worlds of flavour, all made with a whole lot of love.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div key={c.slug} initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                <Link href={`/menu?category=${c.slug}`} className={cn("group flex h-full flex-col items-center gap-3 rounded-3xl border border-white/80 bg-gradient-to-br p-5 text-center shadow-soft transition-all hover:-translate-y-1.5 hover:shadow-float", c.color)}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-mocha transition group-hover:rotate-6">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="font-display text-sm font-semibold text-ink">{c.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function AboutSection() {
  return (
    <section className="container-artisan grid items-center gap-12 py-20 lg:grid-cols-2">
      <div className="relative order-2 h-[420px] overflow-hidden rounded-[2.5rem] border border-beige/50 bg-gradient-to-b from-cream via-[#F4E3CE] to-beige shadow-soft lg:order-1">
        <BunnyScene />
        <div className="absolute bottom-5 left-5 rounded-2xl bg-warm/90 px-4 py-3 shadow-soft backdrop-blur">
          <p className="font-display text-sm font-semibold text-mocha">Meet Buni 🐰</p>
          <p className="text-xs text-muted">Your head barista & happiness officer</p>
        </div>
      </div>
      <div className="order-1 lg:order-2">
        <span className="section-label"><Heart className="h-3.5 w-3.5" /> Our Story</span>
        <h2 className="heading-lg mt-2">A tiny coffee shop with a <span className="text-gradient">big heart.</span></h2>
        <p className="mt-5 leading-relaxed text-muted">
          Artisan Brew Co. started with one simple idea: coffee should feel like a warm hug. We source the finest beans, roast them in small batches, and brew every cup by hand — with a little help from our bunny barista.
        </p>
        <p className="mt-4 leading-relaxed text-muted">
          We believe in slow mornings, perfectly foamed milk, and the kind of atmosphere that makes you stay for one more cup. Whether you're here for a quick espresso or a long afternoon with a book, you're family.
        </p>
        <div className="mt-7 grid grid-cols-3 gap-4">
          {[
            { n: "2018", l: "First cup poured" },
            { n: "12", l: "Single-origin beans" },
            { n: "2.4k", l: "Happy regulars" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-cream/70 p-4 text-center">
              <p className="font-display text-xl font-semibold text-mocha">{s.n}</p>
              <p className="mt-1 text-[11px] text-muted">{s.l}</p>
            </div>
          ))}
        </div>
        <Link href="/about" className="mt-7 inline-flex"><Button variant="secondary">Read our story <ArrowRight className="h-4 w-4" /></Button></Link>
      </div>
    </section>
  );
}

export function Promotions() {
  const promos = [
    { tag: "Seasonal", title: "Pumpkin Spice Bunny", desc: "Cozy up with our seasonal favourite — caramel, cinnamon, and a little magic.", code: "HAPPY10", color: "from-orange-200 to-amber-400", icon: Sparkles },
    { tag: "Combo", title: "Coffee & Croissant", desc: "Any signature drink paired with a fresh butter croissant. Perfect pair.", code: "BUNNY15", color: "from-pink-200 to-rose-300", icon: Heart },
    { tag: "New", title: "Welcome Gift", desc: "First order? Enjoy a little something from us tostart your journey right.", code: "WELCOME20", color: "from-lime-200 to-emerald-300", icon: Gift },
  ];
  return (
    <section className="container-artisan py-20">
      <div className="mb-10 text-center">
        <span className="section-label"><Percent className="h-3.5 w-3.5" /> Special Promotions</span>
        <h2 className="heading-lg mt-2">Sweet deals, just for you</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {promos.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className={cn("relative overflow-hidden rounded-3xl bg-gradient-to-br p-7 shadow-soft transition hover:-translate-y-1.5", p.color)}>
              <Icon className="h-8 w-8 text-mocha/70" />
              <Badge className="mt-4 bg-warm/70 text-mocha">{p.tag}</Badge>
              <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{p.title}</h3>
              <p className="mt-2 text-sm text-ink/70">{p.desc}</p>
              <div className="mt-5 flex items-center justify-between rounded-xl border border-dashed border-mocha/30 bg-warm/60 px-3 py-2">
                <span className="text-xs font-semibold text-mocha">Use code</span>
                <span className="font-display text-sm font-bold tracking-wider text-ink">{p.code}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export function Testimonials() {
  const items = [
    { name: "Rani S.", text: "The bunny foam art made my whole morning. And the latte? Absolutely perfect.", rating: 5 },
    { name: "Dimas P.", text: "Coziest coffee shop in town. I come for the coffee, stay for the vibes and the bunny.", rating: 5 },
    { name: "Nadia K.", text: "Ordered online, paid with QRIS, and tracked my cup like a pro. So smooth!", rating: 5 },
    { name: "Bima A.", text: "The matcha is legit — and that almond croissant is dangerous. Highly recommend.", rating: 4 },
  ];
  return (
    <section className="bg-cream/60 py-20">
      <div className="container-artisan">
        <div className="mb-10 text-center">
          <span className="section-label"><Quote className="h-3.5 w-3.5" /> Kind Words</span>
          <h2 className="heading-lg mt-2">What our coffee family says</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((t, i) => (
            <div key={t.name} className="rounded-3xl border border-white/80 bg-warm/80 p-6 shadow-soft">
              <div className="flex gap-0.5 text-amber-500">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-current" />)}</div>
              <p className="mt-4 text-sm leading-relaxed text-ink/80">“{t.text}”</p>
              <div className="mt-5 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-caramel text-xs font-bold text-white">{t.name[0]}</span>
                <span className="text-xs font-bold text-mocha">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Locations() {
  return (
    <section id="locations" className="container-artisan scroll-mt-24 py-20">
      <div className="mb-10 text-center">
        <span className="section-label"><MapPin className="h-3.5 w-3.5" /> Come Say Hi</span>
        <h2 className="heading-lg mt-2">Your cozy corner awaits</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="relative min-h-[340px] overflow-hidden rounded-3xl bg-gradient-to-br from-beige via-cream to-pink/50 p-8 shadow-soft">
          <div className="absolute right-6 top-6 h-40 w-40 rounded-full bg-warm/40 blur-2xl" />
          <div className="absolute bottom-0 right-0 flex h-40 w-40 items-end justify-center opacity-40">
            <span className="text-[110px] leading-none">🐰☕</span>
          </div>
          <div className="relative">
            <h3 className="font-display text-2xl font-semibold">Artisan Brew Co. — Main</h3>
            <p className="mt-2 max-w-sm text-muted">Jl. Kopi Sensor No. 12, Jakarta Selatan. Look for the bunny logo and the smell of fresh coffee.</p>
            <div className="mt-6 space-y-3 text-sm">
              <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-caramel" /> Mon–Sun · 07.00–22.00</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-caramel" /> +62 812-3456-7890</p>
              <p className="flex items-center gap-2"><Users className="h-4 w-4 text-caramel" /> Dine-in · Takeaway · Delivery</p>
            </div>
            <Link href="/contact" className="mt-6 inline-flex"><Button variant="secondary" size="sm">Get directions <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-beige/50 shadow-soft">
          <iframe
            title="Artisan Brew Co. location"
            src="https://www.openstreetmap.org/export/embed.html?bbox=106.78%2C-6.30%2C106.86%2C-6.24&layer=mapnik"
            className="h-full min-h-[340px] w-full"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
