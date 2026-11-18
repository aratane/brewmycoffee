"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Coffee, ShoppingBag, User, Menu, X, LayoutDashboard, LogOut, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { cartCount, useCart } from "@/store/cart-store";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Our Menu" },
  { href: "/about", label: "About Us" },
  { href: "/#locations", label: "Locations" },
  { href: "/contact", label: "Contact" },
];

export function BunnyMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-mocha text-warm shadow-soft", className)}>
      <span className="absolute -top-1 left-1.5 h-3.5 w-2 -rotate-12 rounded-full bg-white" />
      <span className="absolute -top-1 right-1.5 h-3.5 w-2 rotate-12 rounded-full bg-white" />
      <Coffee className="relative h-4 w-4" strokeWidth={2.4} />
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const count = cartCount(items);

  const isAdmin = ["ADMIN", "SUPER_ADMIN", "CASHIER", "BARISTA"].includes(session?.user?.role ?? "");

  return (
    <header className="sticky top-0 z-40 border-b border-beige/40 bg-warm/85 backdrop-blur-xl">
      <div className="container-artisan flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <BunnyMark className="transition-transform group-hover:-rotate-6" />
          <span className="font-display text-lg font-semibold leading-none text-ink sm:text-xl">
            Artisan<span className="text-caramel"> Brew </span>Co.
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href.split("#")[0]) && link.href !== "/";
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold text-mocha/75 transition hover:bg-cream hover:text-mocha",
                  active && "bg-cream text-mocha"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={openCart}
            aria-label={`Open cart, ${count} items`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-beige/60 bg-white/70 text-mocha transition hover:border-caramel"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink px-1 text-[10px] font-bold text-ink">
                {count}
              </span>
            )}
          </button>

          {session?.user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-beige/60 bg-white/70 py-1.5 pl-1.5 pr-3 text-sm font-semibold text-mocha"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-caramel text-xs text-white">
                  {session.user.name?.[0] ?? "U"}
                </span>
                <span className="max-w-[90px] truncate">{session.user.name?.split(" ")[0]}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {accountOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setAccountOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-52 rounded-2xl border border-beige/50 bg-warm p-2 shadow-float">
                    <MenuItem href="/account"><User className="h-4 w-4" /> My Account</MenuItem>
                    <MenuItem href="/account/orders"><Coffee className="h-4 w-4" /> Order History</MenuItem>
                    {isAdmin && <MenuItem href="/admin"><LayoutDashboard className="h-4 w-4" /> Dashboard</MenuItem>}
                    {session.user.role === "BARISTA" && <MenuItem href="/kitchen"><Sparkles className="h-4 w-4" /> Kitchen Display</MenuItem>}
                    <button
                      onClick={() => { setAccountOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className="hidden sm:inline-flex">
              <Button variant="secondary" size="sm">Sign in</Button>
            </Link>
          )}

          <Link href="/menu" className="hidden sm:inline-flex">
            <Button size="sm">Order Now</Button>
          </Link>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-beige/60 bg-white/70 text-mocha lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-beige/40 bg-warm lg:hidden">
          <nav className="container-artisan flex flex-col gap-1 py-4">
            {LINKS.map((link) => (
              <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-mocha hover:bg-cream">
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 px-4">
              <Link href="/menu" onClick={() => setMobileOpen(false)} className="flex-1"><Button size="sm" className="w-full">Order Now</Button></Link>
              {!session && <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1"><Button size="sm" variant="secondary" className="w-full">Sign in</Button></Link>}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function MenuItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-mocha hover:bg-cream">
      {children}
    </Link>
  );
}
