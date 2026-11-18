"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows, Float } from "@react-three/drei";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { BunnyBarista, type BunnyPose } from "@/components/three/bunny-barista";
import { CoffeeCup } from "@/components/three/coffee-props";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const POSES: BunnyPose[] = ["wave", "holding", "jump", "espresso", "celebrate", "sleep"];

export default function BunnyScene() {
  const [pose, setPose] = useState<BunnyPose>("wave");
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const t = window.setInterval(() => setPose((p) => POSES[(POSES.indexOf(p) + 1) % POSES.length]), 3800);
    return () => window.clearInterval(t);
  }, [reduced]);

  return (
    <Canvas shadows dpr={[1, 1.6]} camera={{ position: [0.4, 1.6, 5], fov: 40 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 6, 4]} intensity={2} castShadow />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2} position={[0, 3, 3]} scale={[4, 3, 1]} color="#FFE2B8" />
      </Environment>
      <group position={[0, -0.9, 0]}>
        <BunnyBarista pose={reduced ? "idle" : pose} scale={1.55} showCup={pose === "holding"} />
      </group>
      <Float speed={1.4} floatIntensity={0.5} rotationIntensity={0.2}>
        <CoffeeCup position={[1.5, 0.6, 0.4]} scale={0.6} float={false} />
      </Float>
      <ContactShadows position={[0, -0.88, 0]} opacity={0.28} scale={6} blur={2.5} far={4} />
      <mesh position={[0, -0.92, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </Canvas>
  );
}
