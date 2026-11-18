import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";
import { Hero } from "@/components/home/hero";
import { AboutSection, BestSellers, CategoryStrip, Locations, Promotions, Testimonials } from "@/components/home/home-sections";
import type { CatalogProduct } from "@/components/menu/product-card";

export const revalidate = 60;

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
    take: 8,
    include: { category: { select: { name: true, slug: true } }, variants: true, addons: true },
  });

  const mapped: CatalogProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: toNumber(p.price),
    imageUrl: p.imageUrl,
    gradient: p.gradient,
    isFeatured: p.isFeatured,
    rating: p.rating,
    soldCount: p.soldCount,
    calories: p.calories,
    preparationTime: p.preparationTime,
    category: p.category,
    variants: p.variants.map((v) => ({ name: v.name, size: v.size, temperature: v.temperature, priceAdjustment: toNumber(v.priceAdjustment) })),
    addons: p.addons.map((a) => ({ id: a.id, name: a.name, price: toNumber(a.price) })),
  }));

  return (
    <>
      <Hero />
      <div className="h-16 bg-gradient-to-b from-transparent via-pink/10 to-transparent" />
      <BestSellers products={mapped.slice(0, 4)} />
      <CategoryStrip />
      <AboutSection />
      <Promotions />
      <Testimonials />
      <Locations />
    </>
  );
}
