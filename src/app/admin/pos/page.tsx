import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";
import { guardPage } from "@/lib/rbac";
import { AdminHeader } from "@/components/admin/admin-ui";
import { PosApp } from "@/components/pos/pos-app";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const user = await guardPage("CASHIER");
  const [products, categories, tables] = await Promise.all([
    prisma.product.findMany({
      where: { isAvailable: true }, orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: { category: { select: { name: true } }, addons: true },
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.table.findMany({ select: { number: true, status: true }, orderBy: { number: "asc" } }),
  ]);

  return (
    <div>
      <AdminHeader title="Point of Sale" description="Fast, touch-friendly, and synced with the rest of the shop." />
      <PosApp
        cashier={user.name ?? "Cashier"}
        categories={categories}
        tables={tables.map((t) => ({ number: t.number, status: t.status }))}
        products={products.map((p) => ({
          id: p.id, name: p.name, sku: p.sku, barcode: p.barcode, price: toNumber(p.price),
          imageUrl: p.imageUrl, gradient: p.gradient, categoryId: p.categoryId, category: p.category.name,
          addons: p.addons.map((a) => ({ name: a.name, price: toNumber(a.price) })),
        }))}
      />
    </div>
  );
}
