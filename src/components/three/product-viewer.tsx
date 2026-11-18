"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { CoffeeCup, Pastry } from "@/components/three/coffee-props";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

function Viewer({
  color,
  liquid,
  isPastry,
  reduced,
}: {
  color: string;
  liquid: string;
  isPastry: boolean;
  reduced: boolean;
}) {
  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 6, 4]} intensity={2.2} castShadow />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.5} position={[0, 3, 3]} scale={[5, 3, 1]} color="#FFE2B8" />
      </Environment>
      <Float speed={reduced ? 0 : 1.6} rotationIntensity={reduced ? 0 : 0.2} floatIntensity={reduced ? 0 : 0.5}>
        {isPastry ? (
          <group scale={2.2} position={[0, 0.2, 0]}>
            <Pastry position={[0, 0, 0]} color={color} scale={1} />
          </group>
        ) : (
          <CoffeeCup scale={1.9} color={color} liquid={liquid} steam={!reduced} float={false} />
        )}
      </Float>
      <ContactShadows position={[0, -0.9, 0]} opacity={0.3} scale={6} blur={2.4} far={4} />
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={3}
        maxDistance={7}
        autoRotate={!reduced}
        autoRotateSpeed={1.4}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
      />
    </>
  );
}

export default function ProductViewer({
  color = "#FFF9F0",
  liquid = "#6B3E26",
  isPastry = false,
}: {
  color?: string;
  liquid?: string;
  isPastry?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [0, 1.2, 5], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; }}
    >
      <Viewer color={color} liquid={liquid} isPastry={isPastry} reduced={reduced} />
    </Canvas>
  );
}
