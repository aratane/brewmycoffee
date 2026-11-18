import { redirect } from "next/navigation";
import type { RoleName } from "@prisma/client";
import { auth } from "@/lib/auth";

const RANK: Record<RoleName, number> = {
  CUSTOMER: 0,
  BARISTA: 1,
  CASHIER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export class AuthError extends Error {
  constructor(message = "You do not have permission to do that.") {
    super(message);
    this.name = "AuthError";
  }
}

/** Returns the current session or null. */
export async function getSession() {
  return auth();
}

/** Requires any authenticated user. Throws AuthError (use in server actions/API). */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new AuthError("Please sign in to continue.");
  return session.user;
}

/** Requires a role at or above `min`. */
export async function requireRole(min: RoleName) {
  const user = await requireUser();
  if (RANK[user.role] < RANK[min]) throw new AuthError();
  return user;
}

/** Page-level guard that redirects instead of throwing. */
export async function guardPage(min: RoleName) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (RANK[session.user.role] < RANK[min]) redirect("/unauthorized");
  return session.user;
}

export const PERMISSIONS = {
  manageProducts: ["ADMIN", "SUPER_ADMIN"] as RoleName[],
  manageInventory: ["ADMIN", "SUPER_ADMIN"] as RoleName[],
  manageEmployees: ["SUPER_ADMIN"] as RoleName[],
  usePos: ["ADMIN", "CASHIER", "SUPER_ADMIN"] as RoleName[],
  kitchen: ["ADMIN", "BARISTA", "SUPER_ADMIN"] as RoleName[],
  viewReports: ["ADMIN", "SUPER_ADMIN"] as RoleName[],
  verifyPayments: ["ADMIN", "SUPER_ADMIN"] as RoleName[],
} as const;

export function can(role: RoleName, allowed: readonly RoleName[]) {
  return allowed.includes(role);
}
