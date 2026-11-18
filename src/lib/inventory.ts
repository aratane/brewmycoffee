import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Deduct ingredients for every item in a completed order.
 * Must be called INSIDE a prisma.$transaction so stock + order status stay consistent.
 * Uses a conditional update (`quantity >= needed`) as a guard against overselling.
 */
export async function deductInventoryForOrder(orderId: string, tx: Tx) {
  // Idempotency guard: a manual-verified order is deducted when confirmed, and
  // must not be deducted a second time when the kitchen marks it completed.
  const alreadyDeducted = await tx.inventoryMovement.count({
    where: { referenceType: "ORDER", referenceId: orderId, type: "SALE" },
  });
  if (alreadyDeducted > 0) return;

  const items = await tx.orderItem.findMany({
    where: { orderId },
    include: { product: { include: { recipes: true } } },
  });

  for (const item of items) {
    if (!item.product?.recipes.length) continue;
    for (const recipe of item.product.recipes) {
      const needed = toNumber(recipe.quantity) * item.quantity;
      const inv = await tx.inventory.findUnique({ where: { ingredientId: recipe.ingredientId } });
      if (!inv) continue;
      const previous = toNumber(inv.quantity);
      const updated = await tx.inventory.updateMany({
        where: { id: inv.id, quantity: { gte: needed } },
        data: { quantity: { decrement: needed } },
      });
      if (updated.count === 0) {
        // Record the shortfall rather than silently going negative.
        await tx.inventoryMovement.create({
          data: {
            inventoryId: inv.id,
            ingredientId: recipe.ingredientId,
            type: "ADJUSTMENT",
            quantity: needed,
            previousQty: previous,
            newQty: previous,
            referenceType: "ORDER_SHORTFALL",
            referenceId: orderId,
            note: `Insufficient stock for ${item.nameSnapshot}`,
          },
        });
        continue;
      }
      await tx.inventoryMovement.create({
        data: {
          inventoryId: inv.id,
          ingredientId: recipe.ingredientId,
          type: "SALE",
          quantity: needed,
          previousQty: previous,
          newQty: previous - needed,
          referenceType: "ORDER",
          referenceId: orderId,
          note: `${item.nameSnapshot} x${item.quantity}`,
        },
      });
    }
    await tx.product.update({
      where: { id: item.productId! },
      data: { soldCount: { increment: item.quantity } },
    });
  }
}

export async function adjustInventory(input: {
  inventoryId: string;
  ingredientId: string;
  type: "PURCHASE" | "ADJUSTMENT" | "WASTE" | "RETURN";
  quantity: number;
  note?: string;
  createdBy?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const inv = await tx.inventory.findUniqueOrThrow({ where: { id: input.inventoryId } });
    const previous = toNumber(inv.quantity);
    const signed =
      input.type === "PURCHASE" || input.type === "RETURN" || input.type === "ADJUSTMENT"
        ? Math.abs(input.quantity)
        : -Math.abs(input.quantity);
    const next = Math.max(0, previous + signed);
    await tx.inventory.update({
      where: { id: inv.id },
      data: {
        quantity: next,
        ...(input.type === "PURCHASE" ? { lastRestocked: new Date() } : {}),
      },
    });
    return tx.inventoryMovement.create({
      data: {
        inventoryId: inv.id,
        ingredientId: input.ingredientId,
        type: input.type,
        quantity: Math.abs(input.quantity),
        previousQty: previous,
        newQty: next,
        note: input.note,
        createdBy: input.createdBy,
      },
    });
  });
}
