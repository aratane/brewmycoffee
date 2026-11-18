import type { CatalogProduct } from "@/components/menu/product-card";
import { toNumber } from "@/lib/utils";

type RawProduct = {
  id: string; name: string; slug: string; description: string; price: unknown;
  imageUrl: string | null; gradient: string; isFeatured: boolean; rating: number;
  soldCount: number; calories: number | null; preparationTime: number;
  category: { name: string; slug: string };
  variants: Array<{ name: string; size: string | null; temperature: string | null; priceAdjustment: unknown }>;
  addons: Array<{ id: string; name: string; price: unknown }>;
};

export function toCatalogProduct(p: RawProduct): CatalogProduct {
  return {
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
  };
}
