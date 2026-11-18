"use client";

import dynamic from "next/dynamic";

const CelebrationScene = dynamic(() => import("@/components/three/celebration-scene"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-3xl bg-cream/50" />,
});

export function CelebrationMount() {
  return <CelebrationScene />;
}
