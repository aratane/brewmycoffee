"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { BunnyBarista } from "@/components/three/bunny-barista";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

function Confetti({ count = 90 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const bits = useMemo(
    () => Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 6,
      z: (Math.random() - 0.5) * 3,
      speed: 0.6 + Math.random() * 1.2,
      spin: Math.random() * Math.PI,
      size: 0.05 + Math.random() * 0.06,
      color: ["#F2C8C7", "#A97850", "#F6EBDD", "#D9B895", "#8FAB72"][Math.floor(Math.random() * 5)],
    })),
    [count]
  );
  useEffect(() => {
    if (!ref.current) return;
    bits.forEach((b, i) => ref.current!.setColorAt(i, new THREE.Color(b.color)));
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [bits]);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    bits.forEach((b, i) => {
      const y = ((t * b.speed + b.spin) % 4) - 1.2;
      dummy.position.set(b.x + Math.sin(t + i) * 0.2, y, b.z);
      dummy.rotation.set(t * 2 + b.spin, t + i, b.spin);
      dummy.scale.setScalar(b.size);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1.6, 0.2]} />
      <meshStandardMaterial roughness={0.6} />
    </instancedMesh>
  );
}

export default function CelebrationScene() {
  const reduced = useReducedMotion();
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 1.3, 5.5], fov: 42 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 6, 4]} intensity={2.2} castShadow />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2} position={[0, 3, 3]} scale={[5, 3, 1]} color="#FFE2B8" />
      </Environment>
      <group position={[0, -1.1, 0]} scale={1.45}>
        <BunnyBarista pose={reduced ? "holding" : "celebrate"} speed={1.2} showCup />
      </group>
      {!reduced && <Confetti />}
    </Canvas>
  );
}
