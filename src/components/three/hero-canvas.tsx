"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { BunnyPose } from "@/components/three/bunny-barista";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const ShopCanvas = dynamic(() => import("@/components/three/coffee-shop-scene"), {
  ssr: false,
  loading: () => <SceneFallback />,
});

function SceneFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-cream via-[#F3E2CC] to-beige">
      <div className="flex flex-col items-center gap-3 text-mocha">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-mocha/20 border-t-mocha" />
        <p className="font-display text-sm font-semibold">Brewing something magical...</p>
      </div>
    </div>
  );
}

export function HeroCanvas({ pose = "wave" }: { pose?: BunnyPose }) {
  const [scroll, setScroll] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScroll(Math.min(1, window.scrollY / Math.max(1, window.innerHeight)));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="h-full w-full" aria-label="Interactive 3D coffee shop with the Artisan Brew Co. bunny barista">
      <ShopCanvas scroll={scroll} pose={pose} reduced={reduced} />
    </div>
  );
}
