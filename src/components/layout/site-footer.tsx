"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Instagram, Facebook, Mail, MapPin, Phone, ArrowRight, Heart } from "lucide-react";
import { BunnyMark } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      toast.success("You're on the list! ☕💕");
      setEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative mt-24 overflow-hidden bg-mocha text-cream">
      <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-caramel/25 blur-3xl" />
      <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-pink/15 blur-3xl" />
      <div className="container-artisan relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <BunnyMark className="!bg-cream !text-mocha" />
            <span className="font-display text-xl font-semibold">Artisan Brew Co.</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">
            Every cup, a little happiness. Handcrafted coffee, cute bunny magic, and a cozy corner for everyone.
          </p>
          <div className="mt-5 flex gap-2">
            {[Instagram, Facebook].map((Icon, i) => (
              <a key={i} href="#" aria-label={i ? "Facebook" : "Instagram"} className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 transition hover:bg-cream/20">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold">Explore</h4>
          <div className="mt-4 flex flex-col gap-2.5 text-sm text-cream/70">
            {[
              ["/menu", "Our Menu"], ["/about", "About Us"], ["/#locations", "Locations"],
              ["/track-order", "Track Order"], ["/contact", "Contact"],
            ].map(([href, label]) => (
              <Link key={label} href={href} className="w-fit transition hover:text-cream">{label}</Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold">Find Us</h4>
          <div className="mt-4 space-y-3 text-sm text-cream/70">
            <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Jl. Kopi Sensor No. 12, Jakarta Selatan</p>
            <p className="flex gap-2"><Phone className="h-4 w-4 shrink-0" /> +62 812-3456-7890</p>
            <p className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0" /> hello@artisanbrew.co</p>
            <p className="pt-2 text-xs text-cream/50">Mon–Sun · 07.00–22.00</p>
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold">A little magic in your inbox</h4>
          <p className="mt-2 text-sm text-cream/70">New drinks, sweet deals, and bunny surprises.</p>
          <form onSubmit={subscribe} className="mt-4 flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="h-11 min-w-0 flex-1 rounded-full border border-cream/20 bg-cream/10 px-4 text-sm text-cream outline-none placeholder:text-cream/40 focus:border-cream/50"
            />
            <Button type="submit" size="icon" variant="pink" disabled={loading} aria-label="Subscribe">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-artisan flex flex-col items-center justify-between gap-2 py-5 text-xs text-cream/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Artisan Brew Co. Brewed with love.</p>
          <p className="flex items-center gap-1">Made with <Heart className="h-3 w-3 fill-pink text-pink" /> and a lot of coffee</p>
        </div>
      </div>
    </footer>
  );
}
