"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Plus, Eye, Sparkles } from "lucide-react";
import { cn, formatIDR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCustomizer } from "@/components/menu/product-customizer";

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string | null;
  gradient: string;
  isFeatured: boolean;
  rating: number;
  soldCount: number;
  calories: number | null;
  preparationTime: number;
  category: { name: string; slug: string };
  variants: Array<{ name: string; size: string | null; temperature: string | null; priceAdjustment: number }>;
  addons: Array<{ id: string; name: string; price: number }>;
};

export function ProductCard({ product, index = 0 }: { product: CatalogProduct; index?: number }) {
  const [customize, setCustomize] = useState(false);
  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.4) }}
        className="group relative flex flex-col overflow-hidden rounded-3xl border border-beige/50 bg-white/80 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float"
      >
        <div className={cn("relative h-52 overflow-hidden bg-gradient-to-br", product.gradient)}>
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-mocha/30 via-transparent to-transparent" />
          {product.isFeatured && (
            <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-warm/90 px-2.5 py-1 text-[10px] font-bold text-mocha shadow-sm backdrop-blur">
              <Sparkles className="h-3 w-3" /> Bestseller
            </span>
          )}
          <Link
            href={`/menu/${product.slug}`}
            aria-label={`View ${product.name}`}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-warm/90 text-mocha opacity-0 shadow-sm transition group-hover:opacity-100"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-caramel">{product.category.name}</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-mocha/60">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {product.rating.toFixed(1)}
            </span>
          </div>
          <h3 className="mt-1.5 font-display text-lg font-semibold leading-tight text-ink">{product.name}</h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">{product.description}</p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-4">
            <div>
              <p className="font-display text-lg font-semibold text-mocha">{formatIDR(product.price)}</p>
              {product.calories && <p className="text-[10px] text-mocha/50">{product.calories} kcal</p>}
            </div>
            <Button size="icon" onClick={() => setCustomize(true)} aria-label={`Add ${product.name} to cart`}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.article>

      <ProductCustomizer product={product} open={customize} onOpenChange={setCustomize} />
    </>
  );
}
