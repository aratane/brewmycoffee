"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { RoleName } from "@prisma/client";
import { LayoutDashboard, ShoppingCart, Receipt, Coffee, Tags, Boxes, Users, CreditCard, BarChart3, ChefHat, Settings, UserCog, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS: Array<{ href: string; label: string; icon: typeof LayoutDashboard; roles?: RoleName[] }> = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/pos", label: "POS", icon: ShoppingCart, roles: ["ADMIN", "SUPER_ADMIN", "CASHIER"] },
  { href: "/admin/orders", label: "Orders", icon: Receipt, roles: ["ADMIN", "SUPER_ADMIN", "CASHIER"] },
  { href: "/admin/products", label: "Products", icon: Coffee, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/categories", label: "Categories", icon: Tags, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/customers", label: "Customers", icon: Users, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/transactions", label: "Transactions", icon: Receipt, roles: ["ADMIN", "SUPER_ADMIN", "CASHIER"] },
  { href: "/admin/payments", label: "Payments", icon: CreditCard, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/employees", label: "Employees", icon: UserCog, roles: ["SUPER_ADMIN"] },
  { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["ADMIN", "SUPER_ADMIN"] },
];

export function AdminNav({ role }: { role: RoleName }) {
  const pathname = usePathname();
  const visible = ITEMS.filter((i) => !i.roles || i.roles.includes(role));
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-beige/40 bg-warm">
      <div className="flex h-16 items-center gap-2 border-b border-beige/40 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-mocha text-sm text-warm">☕</span>
        <span className="font-display text-sm font-semibold">Artisan Brew <span className="text-caramel">Admin</span></span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {visible.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition", active ? "bg-mocha text-warm shadow-sm" : "text-mocha/70 hover:bg-cream")}>
              <Icon className="h-4 w-4" /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-beige/40 p-3">
        <Link href="/kitchen" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-mocha/70 hover:bg-cream"><ChefHat className="h-4 w-4" /> Kitchen Display</Link>
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-mocha/70 hover:bg-cream"><ExternalLink className="h-4 w-4" /> View website</Link>
      </div>
    </aside>
  );
}

export function AdminMobileNav({ role }: { role: RoleName }) {
  const pathname = usePathname();
  const visible = ITEMS.filter((i) => !i.roles || i.roles.includes(role));
  return (
    <nav className="flex w-max gap-1">
      {visible.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold", active ? "bg-mocha text-warm" : "text-mocha/70 hover:bg-cream")}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminTopbar({ name, role }: { name: string; role: RoleName }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-beige/40 bg-warm px-6">
      <div><p className="text-xs text-muted">Welcome back,</p><p className="font-display text-base font-semibold">{name}</p></div>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-cream px-3 py-1.5 text-[11px] font-bold text-mocha">{role.replace("_", " ")}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-caramel text-sm font-bold text-white">{name[0]}</span>
      </div>
    </header>
  );
}
