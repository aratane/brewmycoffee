import { prisma } from "@/lib/prisma";
import { guardPage } from "@/lib/rbac";
import { AdminHeader } from "@/components/admin/admin-ui";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategories() {
  await guardPage("ADMIN");
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return (
    <div>
      <AdminHeader title="Categories" description="Organise your menu into happy little groups." />
      <CategoriesManager categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, productCount: c._count.products, isActive: c.isActive }))} />
    </div>
  );
}
