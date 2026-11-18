import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can, PERMISSIONS } from "@/lib/rbac";
import { adjustInventory } from "@/lib/inventory";
import { toNumber } from "@/lib/utils";

const schema = z.object({
  inventoryId: z.string().min(1),
  ingredientId: z.string().min(1),
  type: z.enum(["PURCHASE", "ADJUSTMENT", "WASTE", "RETURN"]),
  quantity: z.number().positive(),
  note: z.string().max(300).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, PERMISSIONS.manageInventory)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid adjustment" }, { status: 400 });
  const inv = await prisma.inventory.findUnique({ where: { id: parsed.data.inventoryId }, select: { quantity: true } });
  const movement = await adjustInventory({ ...parsed.data, createdBy: session.user.id });
  return NextResponse.json({ ok: true, previous: toNumber(inv?.quantity ?? 0), next: toNumber(movement.newQty) });
}
