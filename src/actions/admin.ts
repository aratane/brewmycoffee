"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { slugify, toNumber } from "@/lib/utils";

export type ActionState = { ok: boolean; error?: string };

export async function createProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireRole("ADMIN");
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const price = Number(formData.get("price"));
    const categoryId = String(formData.get("categoryId") ?? "");
    const sku = String(formData.get("sku") ?? "").trim().toUpperCase();
    const imageUrl = String(formData.get("imageUrl") ?? "").trim();
    if (name.length < 2 || description.length < 5 || !Number.isFinite(price) || price <= 0 || !categoryId || sku.length < 2) {
      return { ok: false, error: "Please fill in name, description, price, category and SKU." };
    }
    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) return { ok: false, error: "That SKU is already in use." };

    const product = await prisma.product.create({
      data: {
        name, slug: slugify(name) + "-" + sku.toLowerCase(), description, price,
        categoryId, sku, imageUrl: imageUrl || null,
        isFeatured: formData.get("isFeatured") === "on",
        isAvailable: formData.get("isAvailable") === "on",
        preparationTime: Number(formData.get("preparationTime")) || 5,
      },
    });
    await audit({ userId: user.id, action: "PRODUCT_CREATE", entity: "Product", entityId: product.id, after: { name, price } });
    revalidatePath("/admin/products");
    revalidatePath("/menu");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not create product" };
  }
}

export async function updateProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireRole("ADMIN");
    const id = String(formData.get("id") ?? "");
    const price = Number(formData.get("price"));
    const stock = formData.get("isAvailable") === "on";
    if (!id || !Number.isFinite(price) || price <= 0) return { ok: false, error: "Invalid product data." };
    await prisma.product.update({
      where: { id },
      data: {
        name: String(formData.get("name") ?? ""), price,
        description: String(formData.get("description") ?? ""),
        isAvailable: stock, isFeatured: formData.get("isFeatured") === "on",
        categoryId: String(formData.get("categoryId") ?? ""),
      },
    });
    await audit({ userId: user.id, action: "PRODUCT_UPDATE", entity: "Product", entityId: id });
    revalidatePath("/admin/products");
    revalidatePath("/menu");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not update product" };
  }
}

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireRole("ADMIN");
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    if (name.length < 2) return { ok: false, error: "Category name is too short." };
    const existing = await prisma.category.findUnique({ where: { slug: slugify(name) } });
    if (existing) return { ok: false, error: "A category with this name already exists." };
    const category = await prisma.category.create({ data: { name, slug: slugify(name), description, sortOrder: Number(formData.get("sortOrder")) || 0 } });
    await audit({ userId: user.id, action: "CATEGORY_CREATE", entity: "Category", entityId: category.id });
    revalidatePath("/admin/categories");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not create category" };
  }
}

export async function createEmployee(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireRole("SUPER_ADMIN");
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const phone = String(formData.get("phone") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const role = String(formData.get("role") ?? "CASHIER") as "ADMIN" | "CASHIER" | "BARISTA";
    const position = String(formData.get("position") ?? "Staff").trim();
    if (!name || !email.includes("@") || password.length < 8) return { ok: false, error: "Please provide a name, valid email and password (8+ characters)." };
    if (!["ADMIN", "CASHIER", "BARISTA"].includes(role)) return { ok: false, error: "Invalid role." };
    const roleRow = await prisma.role.findUnique({ where: { name: role } });
    if (!roleRow) return { ok: false, error: "Role not found." };
    const bcrypt = (await import("bcryptjs")).default;
    const created = await prisma.user.create({
      data: {
        name, email, phone, passwordHash: await bcrypt.hash(password, 12), roleId: roleRow.id,
        employee: { create: { position, cashierCode: `EMP-${Date.now().toString(36).toUpperCase()}` } },
      },
    });
    await audit({ userId: user.id, action: "EMPLOYEE_CREATE", entity: "Employee", entityId: created.id });
    revalidatePath("/admin/employees");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not create employee" };
  }
}

export async function updateSetting(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireRole("ADMIN");
    const entries = [...formData.entries()].filter(([key]) => key.startsWith("setting:"));
    for (const [key, value] of entries) {
      const settingKey = key.replace("setting:", "");
      await prisma.storeSetting.upsert({
        where: { key: settingKey },
        update: { value: { value: String(value) } },
        create: { key: settingKey, value: { value: String(value) } },
      });
    }
    await audit({ userId: user.id, action: "SETTINGS_UPDATE", entity: "StoreSetting", after: entries.map(([k, v]) => ({ k, v })) });
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not save settings" };
  }
}

export async function toggleVoucher(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const id = String(formData.get("id") ?? "");
    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) return { ok: false, error: "Voucher not found" };
    await prisma.voucher.update({ where: { id }, data: { isActive: !voucher.isActive } });
    revalidatePath("/admin/reports");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not update voucher" };
  }
}

export async function createIngredient(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const name = String(formData.get("name") ?? "").trim();
    const unit = String(formData.get("unit") ?? "g").trim();
    const quantity = Number(formData.get("quantity"));
    const min = Number(formData.get("minimumLevel"));
    const cost = Number(formData.get("unitCost"));
    if (!name || !Number.isFinite(quantity)) return { ok: false, error: "Please provide a name and quantity." };
    const existing = await prisma.ingredient.findUnique({ where: { name } });
    if (existing) return { ok: false, error: "Ingredient already exists." };
    await prisma.ingredient.create({
      data: {
        name, unit, costPerUnit: cost,
        inventory: { create: { quantity, minimumLevel: min, unitCost: cost } },
      },
    });
    revalidatePath("/admin/inventory");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not add ingredient" };
  }
}
