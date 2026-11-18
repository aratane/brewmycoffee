"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type BunnyPose =
  | "idle"
  | "wave"
  | "espresso"
  | "holding"
  | "jump"
  | "sleep"
  | "tray"
  | "celebrate"
  | "preparing"
  | "float";

const FUR = "#FFFDF9";
const FUR_SHADE = "#F3E7DA";
const MOCHA = "#704A37";
const PINK = "#F2C8C7";
const EYE = "#3B2418";

function Ear({ side, pose }: { side: -1 | 1; pose: BunnyPose }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!ref.current) return;
    const floppy = pose === "sleep" ? 1.15 : pose === "celebrate" ? -0.25 : 0.12;
    const bounce = pose === "jump" || pose === "celebrate" ? Math.sin(t * 9 + side) * 0.22 : Math.sin(t * 2 + side) * 0.05;
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, side * (0.22 + floppy * 0.45) + bounce, 0.12);
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, pose === "sleep" ? 0.5 : Math.sin(t * 1.6 + side) * 0.06, 0.1);
  });
  return (
    <group ref={ref} position={[side * 0.28, 0.86, -0.02]}>
      <mesh castShadow position={[0, 0.42, 0]} rotation={[0, 0, side * -0.1]}>
        <capsuleGeometry args={[0.12, 0.62, 6, 14]} />
        <meshStandardMaterial color={FUR} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.45, 0.1]} scale={[0.7, 2.6, 0.35]}>
        <sphereGeometry args={[0.1, 14, 14]} />
        <meshStandardMaterial color={PINK} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Arm({ side, pose }: { side: -1 | 1; pose: BunnyPose }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!ref.current) return;
    let x = 0.15;
    let z = side * 0.28;
    if (pose === "wave" && side === 1) { z = side * 1.7; x = -0.5 + Math.sin(t * 8) * 0.22; }
    if (pose === "celebrate") { z = side * 1.9; x = -0.9 + Math.abs(Math.sin(t * 7)) * 0.3; }
    if (pose === "espresso" || pose === "preparing") { z = side * 0.85; x = -0.85; }
    if (pose === "holding" || pose === "tray") { z = side * 0.95; x = -1.0; }
    if (pose === "sleep") { z = side * 0.18; x = 0.1; }
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, x, 0.14);
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, z, 0.14);
  });
  return (
    <group ref={ref} position={[side * 0.34, 0.42, 0.02]}>
      <mesh castShadow position={[0, -0.22, 0]}>
        <capsuleGeometry args={[0.095, 0.4, 5, 12]} />
        <meshStandardMaterial color={FUR} roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.46, 0.02]} scale={[1, 0.8, 0.9]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={FUR_SHADE} roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Original, procedurally-modelled chubby bunny barista with pose-driven animation clips. */
export function BunnyBarista({
  pose = "idle",
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  showCup = false,
  speed = 1,
}: {
  pose?: BunnyPose;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  showCup?: boolean;
  speed?: number;
}) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta * speed;
    const time = t.current;
    if (!root.current || !head.current || !body.current) return;

    const jump = pose === "jump" || pose === "celebrate" ? Math.abs(Math.sin(time * (pose === "celebrate" ? 7 : 4))) * 0.28 : 0;
    root.current.position.y = position[1] + jump + (pose === "float" ? Math.sin(time * 2) * 0.08 : 0);
    root.current.rotation.z = pose === "sleep" ? 0.5 : pose === "celebrate" ? Math.sin(time * 8) * 0.06 : Math.sin(time * 1.5) * 0.012;

    head.current.rotation.z = pose === "sleep" ? 0.32 : pose === "wave" ? -0.08 : Math.sin(time * 1.3) * 0.04;
    head.current.rotation.y = pose === "wave" ? Math.sin(time * 2.4) * 0.14 : Math.sin(time * 0.9) * 0.06;
    body.current.scale.y = pose === "jump" ? 1 + Math.sin(time * 8) * 0.04 : 1;
  });

  const sleeping = pose === "sleep";
  const eyeY = sleeping ? 0.06 : 0.08;

  return (
    <group ref={root} position={position} rotation={rotation} scale={scale} dispose={null}>
      <group ref={body}>
        {/* Feet */}
        {([-1, 1] as const).map((s) => (
          <mesh key={s} castShadow position={[s * 0.22, 0.07, 0.18]} scale={[1, 0.65, 1.35]}>
            <sphereGeometry args={[0.17, 18, 18]} />
            <meshStandardMaterial color={FUR} roughness={0.9} />
          </mesh>
        ))}

        {/* Chubby body */}
        <mesh castShadow receiveShadow position={[0, 0.42, 0]} scale={[1, 1.12, 0.9]}>
          <sphereGeometry args={[0.47, 32, 32]} />
          <meshStandardMaterial color={FUR} roughness={0.88} />
        </mesh>
        <mesh position={[0, 0.3, 0.4]} scale={[0.92, 1.05, 0.28]}>
          <sphereGeometry args={[0.42, 24, 24]} />
          <meshStandardMaterial color="#FFF6EA" roughness={0.9} />
        </mesh>

        {/* Barista apron */}
        <mesh castShadow position={[0, 0.34, 0.4]}>
          <boxGeometry args={[0.62, 0.66, 0.1]} />
          <meshStandardMaterial color={MOCHA} roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.62, 0.46]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.7, 0.1, 0.12]} />
          <meshStandardMaterial color={MOCHA} roughness={0.75} />
        </mesh>
        {/* Coffee bean emblem */}
        <mesh position={[0, 0.38, 0.462]} rotation={[0, 0, 0.5]} scale={[1, 1.35, 0.35]}>
          <sphereGeometry args={[0.065, 16, 16]} />
          <meshStandardMaterial color="#D9B895" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.38, 0.49]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.012, 0.14, 0.01]} />
          <meshStandardMaterial color={MOCHA} />
        </mesh>

        <Arm side={-1} pose={pose} />
        <Arm side={1} pose={pose} />
      </group>

      {/* Head */}
      <group ref={head} position={[0, 1.06, 0.02]}>
        <Ear side={-1} pose={pose} />
        <Ear side={1} pose={pose} />
        <mesh castShadow scale={[1, 0.96, 0.94]}>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshStandardMaterial color={FUR} roughness={0.88} />
        </mesh>

        {/* Eyes */}
        {sleeping ? (
          ([-1, 1] as const).map((s) => (
            <mesh key={s} position={[s * 0.16, 0.06, 0.385]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.07, 0.014, 8, 24, Math.PI]} />
              <meshStandardMaterial color={EYE} />
            </mesh>
          ))
        ) : (
          ([-1, 1] as const).map((s) => (
            <group key={s} position={[s * 0.16, eyeY, 0.38]}>
              <mesh scale={[1, 1.18, 0.6]}>
                <sphereGeometry args={[0.085, 20, 20]} />
                <meshStandardMaterial color={EYE} roughness={0.25} />
              </mesh>
              <mesh position={[s * -0.028, 0.035, 0.055]} scale={[0.9, 0.9, 0.4]}>
                <sphereGeometry args={[0.026, 12, 12]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))
        )}

        {/* Rosy cheeks */}
        {([-1, 1] as const).map((s) => (
          <mesh key={s} position={[s * 0.27, -0.06, 0.31]} scale={[1, 0.62, 0.3]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color={PINK} transparent opacity={0.85} roughness={1} />
          </mesh>
        ))}

        {/* Nose + smile */}
        <mesh position={[0, -0.02, 0.425]} scale={[1, 0.75, 0.7]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color="#E79A9E" roughness={0.6} />
        </mesh>
        {!sleeping && (
          <mesh position={[0, -0.13, 0.405]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.075, 0.011, 8, 28, Math.PI]} />
            <meshStandardMaterial color={EYE} />
          </mesh>
        )}

        {/* Whiskers */}
        {([-1, 1] as const).map((s) =>
          [0, 1].map((i) => (
            <mesh key={`${s}-${i}`} position={[s * 0.3, -0.05 + i * 0.05, 0.28]} rotation={[0, 0, s * (0.12 + i * 0.18)]}>
              <boxGeometry args={[0.22, 0.006, 0.006]} />
              <meshBasicMaterial color="#C8A88F" />
            </mesh>
          ))
        )}
      </group>

      {(showCup || pose === "holding" || pose === "espresso") && (
        <group position={[0.34, 0.4, 0.55]} scale={0.55}>
          <mesh castShadow>
            <cylinderGeometry args={[0.28, 0.22, 0.42, 24]} />
            <meshStandardMaterial color="#FFF9F0" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.02, 24]} />
            <meshStandardMaterial color="#5A3524" roughness={0.4} />
          </mesh>
          <mesh position={[0.32, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.14, 0.035, 10, 24]} />
            <meshStandardMaterial color="#FFF9F0" roughness={0.6} />
          </mesh>
        </group>
      )}

      {pose === "tray" && (
        <group position={[0, 0.26, 0.62]}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.05, 0.5]} />
            <meshStandardMaterial color={MOCHA} roughness={0.6} />
          </mesh>
          {[-0.26, 0, 0.26].map((x) => (
            <mesh key={x} position={[x, 0.16, 0]}>
              <cylinderGeometry args={[0.1, 0.08, 0.24, 16]} />
              <meshStandardMaterial color="#FFF9F0" roughness={0.6} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
