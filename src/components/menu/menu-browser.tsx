"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Coffee } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ProductCard, type CatalogProduct } from "@/components/menu/product-card";

export function MenuBrowser({
  products,
  categories,
  initialCategory,
}: {
  products: CatalogProduct[];
  categories: Array<{ name: string; slug: string }>;
  initialCategory?: string;
}) {
  const [category, setCategory] = useState(initialCategory ?? "all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(() => {
    let result = products.filter((p) => (category === "all" || p.category.slug === category) && (p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase())));
    if (sort === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [products, category, query, sort]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterPill active={category === "all"} onClick={() => setCategory("all")}>All Drinks & Treats</FilterPill>
          {categories.map((c) => (
            <FilterPill key={c.slug} active={category === c.slug} onClick={() => setCategory(c.slug)}>{c.name}</FilterPill>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mocha/50" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your happy cup..." className="w-full pl-9 sm:w-64" />
          </div>
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mocha/50" />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-artisan h-11 w-full appearance-none pl-9 pr-8 sm:w-48">
              <option value="featured">Featured first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </div>
      </div>

      <p className="mb-5 text-sm text-muted">Showing <span className="font-bold text-mocha">{filtered.length}</span> happy cups</p>

      {filtered.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-beige/70 bg-white/50 text-center">
          <span className="text-6xl">☕</span>
          <h3 className="mt-4 font-display text-xl font-semibold">No cups found!</h3>
          <p className="mt-1 text-sm text-muted">Try a different search or category. Buni is still brewing ideas.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("rounded-full border px-4 py-2 text-xs font-bold transition", active ? "border-mocha bg-mocha text-warm shadow-soft" : "border-beige/60 bg-white/70 text-mocha hover:border-caramel")}>
      {children}
    </button>
  );
}
