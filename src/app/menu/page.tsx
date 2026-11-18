import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { toCatalogProduct } from "@/lib/catalog";
import { MenuBrowser } from "@/components/menu/menu-browser";
import { MICROCOPY } from "@/lib/constants";

export const metadata: Metadata = { title: "Our Menu", description: "Find your happy cup at Artisan Brew Co." };
export const revalidate = 60;

export default async function MenuPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isAvailable: true },
      orderBy: [{ isFeatured: "desc" }, { category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: { category: { select: { name: true, slug: true } }, variants: true, addons: true },
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { name: true, slug: true } }),
  ]);

  return (
    <div className="blob-bg">
      <div className="container-artisan py-12">
        <div className="mb-10 text-center">
          <span className="section-label">☕ The Good Stuff</span>
          <h1 className="heading-xl mt-3">{MICROCOPY.menu}</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">Signature coffee, silky lattes, wholesome matcha, and little sweet treats — all made fresh, all made with love.</p>
        </div>
        <MenuBrowser products={products.map(toCatalogProduct)} categories={categories} initialCategory={category} />
      </div>
    </div>
  );
}
