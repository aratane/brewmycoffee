import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toCatalogProduct } from "@/lib/catalog";
import { ProductDetail } from "@/components/menu/product-detail";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true, description: true } });
  return { title: product?.name ?? "Product", description: product?.description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      variants: true,
      addons: true,
      reviews: { where: { isApproved: true }, orderBy: { createdAt: "desc" }, take: 10, include: { customer: { select: { name: true } } } },
    },
  });
  if (!product || !product.isAvailable) notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isAvailable: true },
    take: 4,
    include: { category: { select: { name: true, slug: true } }, variants: true, addons: true },
  });

  return (
    <ProductDetail
      product={toCatalogProduct(product)}
      reviews={product.reviews.map((r) => ({ id: r.id, rating: r.rating, comment: r.comment, createdAt: r.createdAt.toISOString(), customer: r.customer }))}
      related={related.map(toCatalogProduct)}
    />
  );
}
