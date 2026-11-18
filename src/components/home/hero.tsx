"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ArrowDown, ArrowRight, Coffee, Sparkles, Star } from "lucide-react";
import { HeroCanvas } from "@/components/three/hero-canvas";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import type { BunnyPose } from "@/components/three/bunny-barista";

const POSES: BunnyPose[] = ["wave", "espresso", "holding", "jump", "preparing"];

export function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const [pose, setPose] = useState<BunnyPose>("wave");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-line]", { y: 40, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.2 });
      gsap.from("[data-hero-cta]", { y: 20, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power2.out", delay: 0.7 });
      gsap.to("[data-scroll-cue]", { y: 8, repeat: -1, yoyo: true, duration: 1.2, ease: "sine.inOut" });
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setPose((p) => POSES[(POSES.indexOf(p) + 1) % POSES.length]), 4500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section ref={root} className="relative min-h-[720px] overflow-hidden bg-cream pt-2 lg:min-h-[820px]">
      <div className="absolute inset-0 opacity-95">
        <HeroCanvas pose={pose} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-warm/95 via-warm/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-warm to-transparent" />

      <div className="container-artisan relative z-10 flex min-h-[680px] flex-col justify-center py-16 lg:min-h-[760px]">
        <div className="max-w-2xl">
          <div data-hero-line className="mb-5 inline-flex items-center gap-2 rounded-full border border-caramel/25 bg-warm/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-mocha shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-caramel" /> Welcome to Artisan Brew Co.!
          </div>

          <h1 className="font-display text-[2.7rem] font-semibold leading-[1.03] tracking-tight text-ink sm:text-6xl lg:text-[4.7rem]">
            <span data-hero-line className="block">EVERY CUP,</span>
            <span data-hero-line className="block text-gradient">A LITTLE</span>
            <span data-hero-line className="block">HAPPINESS.</span>
          </h1>

          <p data-hero-line className="mt-6 max-w-lg text-base leading-relaxed text-mocha/80 sm:text-lg">
            Freshly brewed coffee, handcrafted with love, served with a little bunny magic.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic>
              <Link data-hero-cta href="/menu">
                <Button size="lg" className="group">
                  Explore Our Menu
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link data-hero-cta href="/cart">
                <Button size="lg" variant="secondary">Order Your Coffee</Button>
              </Link>
            </Magnetic>
          </div>

          <div data-hero-cta className="mt-10 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["🐰", "☕", "🥐"].map((e) => (
                  <span key={e} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-warm bg-pink/60 text-sm">{e}</span>
                ))}
              </div>
              <div className="text-xs font-semibold text-mocha">
                <span className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                </span>
                <span className="text-mocha/60">2,400+ happy sippers</span>
              </div>
            </div>
            <div className="h-8 w-px bg-mocha/15" />
            <div className="flex items-center gap-2 text-xs font-semibold text-mocha">
              <Coffee className="h-4 w-4 text-caramel" /> Roasted fresh daily
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-mocha/50">
        <span className="text-[10px] font-bold uppercase tracking-widest">Come on in</span>
        <ArrowDown data-scroll-cue className="h-4 w-4" />
      </div>

      <span className="sr-only" aria-live="polite">Bunny barista is now {pose}</span>
    </section>
  );
}
