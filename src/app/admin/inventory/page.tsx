import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";
import { guardPage } from "@/lib/rbac";
import { AdminHeader } from "@/components/admin/admin-ui";
import { InventoryManager } from "@/components/admin/inventory-manager";

export const dynamic = "force-dynamic";

export default async function AdminInventory() {
  await guardPage("ADMIN");
  const inventory = await prisma.inventory.findMany({
    orderBy: { ingredient: { name: "asc" } },
    include: {
      ingredient: { select: { name: true, unit: true } },
      movements: { orderBy: { createdAt: "desc" }, take: 8 },
    },
  });
  return (
    <div>
      <AdminHeader title="Inventory" description="Track ingredients, stock levels and every movement." />
      <InventoryManager rows={inventory.map((i) => ({
        id: i.id,
        ingredientId: i.ingredientId,
        ingredient: i.ingredient.name,
        unit: i.ingredient.unit,
        quantity: toNumber(i.quantity),
        minimum: toNumber(i.minimumLevel),
        unitCost: toNumber(i.unitCost),
        movements: i.movements.map((m) => ({
          id: m.id, type: m.type, quantity: toNumber(m.quantity),
          previousQty: toNumber(m.previousQty), newQty: toNumber(m.newQty),
          note: m.note, createdAt: m.createdAt.toISOString(),
        })),
      }))} />
    </div>
  );
}
