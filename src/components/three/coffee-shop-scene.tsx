"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";
import { BunnyBarista, type BunnyPose } from "@/components/three/bunny-barista";
import { CoffeeCup, CoffeeBeanCloud, EspressoMachine, Pastry, HangingLamp, PottedPlant } from "@/components/three/coffee-props";

function CameraRig({ scroll = 0, reduced = false }: { scroll?: number; reduced?: boolean }) {
  const { camera, pointer } = useThree();
  const look = useRef(new THREE.Vector3(0, 1.1, 0));
  useFrame(() => {
    const mx = reduced ? 0 : pointer.x;
    const my = reduced ? 0 : pointer.y;
    const targetZ = 7.4 - scroll * 2.4;
    const targetY = 2.5 - scroll * 0.55 + my * 0.22;
    const targetX = mx * 0.85;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    look.current.lerp(new THREE.Vector3(mx * 0.12, 1.1 + scroll * 0.18, 0), 0.05);
    camera.lookAt(look.current);
  });
  return null;
}

function WoodFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#B98A62" roughness={0.85} />
      </mesh>
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -6 + i * 0.9]}>
          <planeGeometry args={[40, 0.012]} />
          <meshStandardMaterial color="#8F6647" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function BackWall() {
  return (
    <group>
      <mesh position={[0, 3, -4.2]} receiveShadow>
        <boxGeometry args={[18, 7, 0.3]} />
        <meshStandardMaterial color="#F1DFC8" roughness={0.95} />
      </mesh>
      {/* Window with warm light */}
      <mesh position={[-4.2, 3.4, -4.02]}>
        <planeGeometry args={[2.6, 2.8]} />
        <meshStandardMaterial color="#FFE7BE" emissive="#FFD9A0" emissiveIntensity={0.7} />
      </mesh>
      {[[-4.2, 3.4], [0, 3.4]].map(([x, y]) => (
        <mesh key={`${x}-h`} position={[x, y, -3.98]}>
          <boxGeometry args={[2.7, 0.06, 0.05]} />
          <meshStandardMaterial color="#704A37" />
        </mesh>
      ))}
      <mesh position={[-4.2, 3.4, -3.98]}>
        <boxGeometry args={[0.06, 2.85, 0.05]} />
        <meshStandardMaterial color="#704A37" />
      </mesh>
      {/* Menu board */}
      <mesh position={[2.8, 3.5, -4.02]}>
        <boxGeometry args={[3.1, 1.8, 0.08]} />
        <meshStandardMaterial color="#4A3126" roughness={0.8} />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[2.1, 4.05 - i * 0.28, -3.96]}>
          <boxGeometry args={[1.1 - (i % 2) * 0.3, 0.045, 0.01]} />
          <meshStandardMaterial color="#E8D2B5" emissive="#E8D2B5" emissiveIntensity={0.1} />
        </mesh>
      ))}
    </group>
  );
}

function Counter() {
  return (
    <group position={[0, 0, 1.2]}>
      <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[6.2, 1.1, 1.1]} />
        <meshStandardMaterial color="#8B6247" roughness={0.8} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.13, 0]}>
        <boxGeometry args={[6.6, 0.12, 1.3]} />
        <meshStandardMaterial color="#D9B895" roughness={0.5} metalness={0.05} />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[-2.4 + i * 1.2, 0.55, 0.56]}>
          <boxGeometry args={[1.0, 0.82, 0.02]} />
          <meshStandardMaterial color="#9C7150" roughness={0.9} />
        </mesh>
      ))}
      {/* Pastry case */}
      <mesh position={[1.9, 1.42, 0]}>
        <boxGeometry args={[1.6, 0.5, 0.8]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.18} roughness={0.1} metalness={0.1} />
      </mesh>
      <Pastry position={[1.5, 1.3, 0]} scale={0.55} color="#D9A05B" />
      <Pastry position={[2.3, 1.3, 0.1]} scale={0.5} color="#E8B4B3" />
    </group>
  );
}

function Shelves() {
  return (
    <group position={[0, 0, -3.85]}>
      {[1.7, 2.45].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[5.4, 0.1, 0.42]} />
          <meshStandardMaterial color="#704A37" roughness={0.7} />
        </mesh>
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[-2.4 + (i % 6) * 0.95, i < 6 ? 1.93 : 2.68, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.09, 0.32, 12]} />
          <meshStandardMaterial color={i % 3 === 0 ? "#F6EBDD" : i % 3 === 1 ? "#A97850" : "#F2C8C7"} roughness={0.6} />
        </mesh>
      ))}
      {/* Coffee bags */}
      {[-1.6, -0.7, 0.2].map((x, i) => (
        <mesh key={x} position={[x, 2.95, 0]} castShadow>
          <boxGeometry args={[0.45, 0.6, 0.3]} />
          <meshStandardMaterial color={["#5A3524", "#704A37", "#A97850"][i]} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export function CoffeeShopScene({ scroll = 0, pose = "wave", reduced = false }: { scroll?: number; pose?: BunnyPose; reduced?: boolean }) {
  return (
    <>
      <color attach="background" args={["#F6EBDD"]} />
      <fog attach="fog" args={["#F6EBDD", 10, 24]} />
      <CameraRig scroll={scroll} reduced={reduced} />

      <ambientLight intensity={0.9} />
      <hemisphereLight args={["#FFE9C9", "#8B6247", 1.1]} />
      <directionalLight
        castShadow
        position={[-5, 8, 5]}
        intensity={2.4}
        color="#FFE4BC"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <spotLight position={[4, 6, 3]} angle={0.5} penumbra={1} intensity={1.4} color="#FFD9A0" />

      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[-4, 4, 3]} scale={[6, 3, 1]} color="#FFE2B8" />
        <Lightformer form="rect" intensity={1.6} position={[5, 2, 2]} scale={[4, 4, 1]} color="#F2C8C7" />
      </Environment>

      <WoodFloor />
      <BackWall />
      <Shelves />
      <Counter />

      <group position={[0, 1.2, -1.5]}>
        <EspressoMachine position={[-1.9, 0, 0]} scale={0.85} />
      </group>

      <BunnyBarista pose={pose} position={[0.4, 1.2, -0.6]} scale={0.92} showCup={pose === "holding"} />

      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
        <CoffeeCup position={[-2.3, 2.6, 0.8]} scale={0.65} />
      </Float>
      <Float speed={1.6} rotationIntensity={0.2} floatIntensity={0.6}>
        <CoffeeCup position={[2.5, 2.9, 0.3]} scale={0.55} liquid="#D9B895" />
      </Float>
      <Float speed={1} rotationIntensity={0.25} floatIntensity={0.4}>
        <CoffeeCup position={[3.4, 1.9, 1.4]} scale={0.5} color="#F2C8C7" />
      </Float>

      <CoffeeBeanCloud count={26} radius={3.8} />
      <HangingLamp position={[-2.6, 3.6, -0.6]} />
      <HangingLamp position={[2.4, 3.9, -1.2]} />
      <PottedPlant position={[-4.4, 0, -1]} scale={1.4} />
      <PottedPlant position={[4.4, 0, -1.4]} scale={1.2} />

      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={16} blur={2.6} far={6} resolution={512} color="#5A3524" />
    </>
  );
}

export default function ShopCanvas({
  scroll = 0,
  pose = "wave",
  reduced = false,
}: {
  scroll?: number;
  pose?: BunnyPose;
  reduced?: boolean;
}) {
  return (
    <Canvas
      shadows
      dpr={reduced ? 1 : [1, 1.8]}
      camera={{ position: [0, 2.5, 7.4], fov: 42, near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
    >
      <CoffeeShopScene scroll={scroll} pose={pose} reduced={reduced} />
    </Canvas>
  );
}
