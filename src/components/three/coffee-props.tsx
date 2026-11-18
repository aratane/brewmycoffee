"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** A procedural latte cup with liquid surface, handle, saucer and rising steam. */
export function CoffeeCup({
  position = [0, 0, 0],
  scale = 1,
  color = "#FFF9F0",
  liquid = "#6B3E26",
  steam = true,
  float = true,
}: {
  position?: [number, number, number];
  scale?: number;
  color?: string;
  liquid?: string;
  steam?: boolean;
  float?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const puffs = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current && float) group.current.position.y = position[1] + Math.sin(t * 1.5 + position[0]) * 0.09;
    if (puffs.current) {
      puffs.current.children.forEach((child, i) => {
        const phase = (t * 0.35 + i / puffs.current!.children.length) % 1;
        child.position.y = 0.28 + phase * 0.75;
        child.position.x = Math.sin(phase * 7 + i) * 0.06;
        child.scale.setScalar(0.035 + phase * 0.09);
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = (1 - phase) * 0.32;
      });
    }
  });
  return (
    <group ref={group} position={position} scale={scale}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.21, 0.42, 28]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0.205, 0]}>
        <cylinderGeometry args={[0.255, 0.255, 0.016, 28]} />
        <meshStandardMaterial color={liquid} roughness={0.35} />
      </mesh>
      <mesh position={[0.31, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.14, 0.038, 12, 28]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh position={[0, -0.23, 0]} receiveShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.022, 28]} />
        <meshStandardMaterial color="#F3E4D2" roughness={0.7} />
      </mesh>
      {steam && (
        <group ref={puffs}>
          {Array.from({ length: 7 }).map((_, i) => (
            <mesh key={i} position={[0, 0.3, 0]}>
              <sphereGeometry args={[1, 8, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.2} depthWrite={false} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

/** Instanced floating coffee beans — one draw call for the whole cloud. */
export function CoffeeBeanCloud({ count = 24, radius = 3.4 }: { count?: number; radius?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2 + Math.random() * 0.5,
        y: 0.6 + Math.random() * 3.2,
        r: radius * (0.65 + Math.random() * 0.5),
        speed: 0.12 + Math.random() * 0.22,
        scale: 0.07 + Math.random() * 0.06,
        spin: Math.random() * Math.PI,
      })),
    [count, radius]
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!ref.current) return;
    data.forEach((_, i) => ref.current!.setColorAt(i, new THREE.Color(i % 3 === 0 ? "#A97850" : "#5A3524")));
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [data]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    data.forEach((b, i) => {
      const a = b.angle + t * b.speed;
      dummy.position.set(Math.cos(a) * b.r, b.y + Math.sin(t * 0.7 + i) * 0.22, Math.sin(a) * b.r * 0.5);
      dummy.rotation.set(b.spin + t * 0.4, a, b.spin * 0.5);
      dummy.scale.set(b.scale * 1.5, b.scale, b.scale);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial color="#ffffff" roughness={0.7} />
    </instancedMesh>
  );
}

/** A stylized espresso machine with group-headed brew head and steam wand. */
export function EspressoMachine({ position = [0, 0, 0], scale = 1 }: { position?: [number, number, number]; scale?: number }) {
  const knob = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (knob.current) knob.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.5;
  });
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.42, 0]}>
        <boxGeometry args={[1.5, 0.85, 0.7]} />
        <meshStandardMaterial color="#C94F3D" metalness={0.35} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.86, 0]}>
        <boxGeometry args={[1.55, 0.12, 0.75]} />
        <meshStandardMaterial color="#F6EBDD" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.42, 0.37]}>
        <boxGeometry args={[1.1, 0.45, 0.03]} />
        <meshStandardMaterial color="#3B2A22" metalness={0.5} roughness={0.3} />
      </mesh>
      {[-0.42, 0.42].map((x) => (
        <group key={x} position={[x, 0.18, 0.42]}>
          <mesh>
            <cylinderGeometry args={[0.09, 0.09, 0.18, 14]} />
            <meshStandardMaterial color="#D9B895" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.14, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.12, 10]} />
            <meshStandardMaterial color="#704A37" />
          </mesh>
        </group>
      ))}
      <mesh ref={knob} position={[0.5, 0.66, 0.38]}>
        <cylinderGeometry args={[0.1, 0.1, 0.06, 16]} />
        <meshStandardMaterial color="#F6EBDD" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.65, 0.18, 0.42]} rotation={[0.3, 0, 0.3]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
        <meshStandardMaterial color="#D9B895" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function Pastry({ position = [0, 0, 0], color = "#D9A05B", scale = 1 }: { position?: [number, number, number]; color?: string; scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.4 + position[0] * 3) * 0.06;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh castShadow rotation={[0, 0, 0.1]}>
        <torusGeometry args={[0.22, 0.09, 10, 24]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.02, 0]} scale={[1, 0.5, 1]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#E8BC82" roughness={0.85} />
      </mesh>
    </group>
  );
}

export function HangingLamp({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 1.4, 6]} />
        <meshStandardMaterial color="#3B2A22" />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <coneGeometry args={[0.28, 0.3, 24, 1, true]} />
        <meshStandardMaterial color="#704A37" side={THREE.DoubleSide} roughness={0.6} />
      </mesh>
      <pointLight position={[0, -0.15, 0]} intensity={6} distance={4} color="#FFD9A0" castShadow={false} />
    </group>
  );
}

export function PottedPlant({ position = [0, 0, 0], scale = 1 }: { position?: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.36, 16]} />
        <meshStandardMaterial color="#C97B5A" roughness={0.8} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.12, 0.55 + (i % 3) * 0.09, Math.sin(a) * 0.12]} rotation={[0.3, a, 0.35]} scale={[0.09, 0.34, 0.05]}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshStandardMaterial color={i % 2 ? "#6B8E5A" : "#8FAB72"} roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}
