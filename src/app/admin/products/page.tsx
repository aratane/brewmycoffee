import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";
import { guardPage } from "@/lib/rbac";
import { AdminHeader } from "@/components/admin/admin-ui";
import { ProductsManager } from "@/components/admin/products-manager";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  await guardPage("ADMIN");
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ orderBy: { sortOrder: "asc" }, include: { category: { select: { name: true } } } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  return (
    <div>
      <AdminHeader title="Products" description="Manage your menu, prices and availability." />
      <ProductsManager
        products={products.map((p) => ({ id: p.id, name: p.name, sku: p.sku, price: toNumber(p.price), imageUrl: p.imageUrl, isAvailable: p.isAvailable, isFeatured: p.isFeatured, soldCount: p.soldCount, category: p.category, categoryId: p.categoryId, description: p.description, preparationTime: p.preparationTime }))}
        categories={categories}
      />
    </div>
  );
}
