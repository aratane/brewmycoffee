"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Coffee, User, Gift, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/account", label: "Overview", icon: LayoutGrid },
  { href: "/account/orders", label: "My Orders", icon: Coffee },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/rewards", label: "Rewards", icon: Gift },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <aside className="h-fit rounded-3xl border border-beige/50 bg-white/70 p-3 shadow-soft lg:w-60 lg:shrink-0">
      <nav className="flex gap-1 overflow-x-auto lg:flex-col">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition", active ? "bg-mocha text-warm" : "text-mocha/75 hover:bg-cream")}>
              <Icon className="h-4 w-4" /> {label}
            </Link>
          );
        })}
        <button onClick={() => signOut({ callbackUrl: "/" })} className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 lg:mt-2 lg:border-t lg:border-beige/40 lg:pt-4">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </nav>
    </aside>
  );
}
