"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import { useTheme } from "next-themes";
import * as THREE from "three";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

type Variant = "preloader" | "hero";

interface VLogoSceneProps {
  variant?: Variant;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/* Geometry                                                                   */
/* -------------------------------------------------------------------------- */

const COLOR_BOTTOM = new THREE.Color("#2563eb"); // brand blue (V's point)
const COLOR_TOP = new THREE.Color("#a855f7"); // brand violet (V's arms)

/** Map a blue→violet gradient onto vertices along the Y axis. */
function applyGradientColors(geo: THREE.BufferGeometry): void {
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  if (!bb) return;
  const minY = bb.min.y;
  const spanY = bb.max.y - bb.min.y || 1;
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i += 1) {
    const t = (pos.getY(i) - minY) / spanY;
    tmp.copy(COLOR_BOTTOM).lerp(COLOR_TOP, t);
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
}

/** Procedural extruded, bevelled "V" built from a thick-chevron 2D path. */
function buildVGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  // Outer V: top-left → bottom point → top-right
  shape.moveTo(-1.0, 1.1);
  shape.lineTo(0, -1.1);
  shape.lineTo(1.0, 1.1);
  // Inner notch (back up the inside of the chevron)
  shape.lineTo(0.5, 1.1);
  shape.lineTo(0, -0.25);
  shape.lineTo(-0.5, 1.1);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.45,
    bevelEnabled: true,
    bevelThickness: 0.09,
    bevelSize: 0.07,
    bevelSegments: 4,
    curveSegments: 8,
  });
  geo.center();
  applyGradientColors(geo);
  return geo;
}

/* -------------------------------------------------------------------------- */
/* Pixel-dispersion cube field                                                */
/* -------------------------------------------------------------------------- */

interface CubeData {
  targets: Float32Array; // resting position (clustered upper-left of the V)
  starts: Float32Array; // scattered origin for the preloader assembly
  seeds: Float32Array; // per-cube randomness for stagger + drift
  sizes: Float32Array; // per-cube scale
}

function buildCubes(count: number): CubeData {
  const targets = new Float32Array(count * 3);
  const starts = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    // Cluster toward the upper-left of the V (the logo's pixel trail).
    const tx = -1.5 + Math.random() * 1.7; // mostly negative x
    const ty = 0.2 + Math.random() * 1.5; // upper half
    const tz = (Math.random() - 0.5) * 0.7;
    targets[i * 3] = tx;
    targets[i * 3 + 1] = ty;
    targets[i * 3 + 2] = tz;

    // Scattered start: pushed outward from the target.
    const angle = Math.random() * Math.PI * 2;
    const radius = 2.5 + Math.random() * 4;
    starts[i * 3] = tx + Math.cos(angle) * radius;
    starts[i * 3 + 1] = ty + Math.sin(angle) * radius * 0.7 + 1.5;
    starts[i * 3 + 2] = tz + (Math.random() - 0.5) * 4;

    seeds[i] = Math.random();
    sizes[i] = 0.05 + Math.random() * 0.08;
  }
  return { targets, starts, seeds, sizes };
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/* -------------------------------------------------------------------------- */
/* Scene content (inside the Canvas)                                          */
/* -------------------------------------------------------------------------- */

interface VContentProps {
  variant: Variant;
  reducedMotion: boolean;
  isDark: boolean;
  cubeCount: number;
}

const ASSEMBLE_DURATION = 0.95;
const STAGGER_WINDOW = 0.7;

function VContent({ variant, reducedMotion, isDark, cubeCount }: VContentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cubesRef = useRef<THREE.InstancedMesh>(null);

  const geometry = useMemo(() => buildVGeometry(), []);
  const cubes = useMemo(() => buildCubes(cubeCount), [cubeCount]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  const emissiveIntensity = isDark ? 0.55 : 0.28;

  // Dispose procedural geometry on unmount.
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Initialise instance matrices + per-cube colours.
  useLayoutEffect(() => {
    const mesh = cubesRef.current;
    if (!mesh) return;
    for (let i = 0; i < cubeCount; i += 1) {
      const s = cubes.sizes[i];
      const useStart = variant === "preloader" && !reducedMotion;
      const ax = useStart ? cubes.starts : cubes.targets;
      dummy.position.set(ax[i * 3], ax[i * 3 + 1], ax[i * 3 + 2]);
      dummy.scale.setScalar(useStart ? 0 : s);
      dummy.rotation.set(cubes.seeds[i] * 6, cubes.seeds[i] * 4, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      tmpColor.copy(COLOR_BOTTOM).lerp(COLOR_TOP, cubes.seeds[i]);
      mesh.setColorAt(i, tmpColor);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [cubes, cubeCount, dummy, reducedMotion, tmpColor, variant]);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    const group = groupRef.current;
    const mesh = cubesRef.current;

    if (variant === "preloader") {
      // V assembles: scale + gentle spin in, then a slow continuous turn.
      const intro = easeOutCubic(Math.min(t / 1.2, 1));
      if (group) {
        const scale = 0.55 + intro * 0.45;
        group.scale.setScalar(scale);
        group.rotation.y = (1 - intro) * 2.2 + t * 0.35;
        group.rotation.x = (1 - intro) * 0.6;
      }
      if (mesh) {
        for (let i = 0; i < cubeCount; i += 1) {
          const local = (t - cubes.seeds[i] * STAGGER_WINDOW) / ASSEMBLE_DURATION;
          const e = easeOutCubic(Math.max(0, Math.min(local, 1)));
          const sx = cubes.starts[i * 3];
          const sy = cubes.starts[i * 3 + 1];
          const sz = cubes.starts[i * 3 + 2];
          const gx = cubes.targets[i * 3];
          const gy = cubes.targets[i * 3 + 1];
          const gz = cubes.targets[i * 3 + 2];
          dummy.position.set(
            sx + (gx - sx) * e,
            sy + (gy - sy) * e,
            sz + (gz - sz) * e,
          );
          dummy.scale.setScalar(cubes.sizes[i] * e);
          dummy.rotation.set(
            cubes.seeds[i] * 6 + t * 0.8 * (1 - e),
            cubes.seeds[i] * 4 + t * 0.8 * (1 - e),
            0,
          );
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
      }
    } else {
      // Hero: calm float + subtle pointer parallax, cubes drift in place.
      if (group) {
        const targetRotY = state.pointer.x * 0.35;
        const targetRotX = -state.pointer.y * 0.25;
        group.rotation.y += (targetRotY - group.rotation.y) * Math.min(delta * 2.5, 1);
        group.rotation.x += (targetRotX - group.rotation.x) * Math.min(delta * 2.5, 1);
        group.position.y = Math.sin(t * 0.8) * 0.08;
        group.scale.setScalar(1);
      }
      if (mesh) {
        for (let i = 0; i < cubeCount; i += 1) {
          const seed = cubes.seeds[i];
          const gx = cubes.targets[i * 3];
          const gy = cubes.targets[i * 3 + 1];
          const gz = cubes.targets[i * 3 + 2];
          dummy.position.set(
            gx + Math.sin(t * 0.6 + seed * 9) * 0.06,
            gy + Math.cos(t * 0.5 + seed * 7) * 0.07,
            gz + Math.sin(t * 0.4 + seed * 5) * 0.05,
          );
          dummy.scale.setScalar(cubes.sizes[i]);
          dummy.rotation.set(seed * 6 + t * 0.2, seed * 4 + t * 0.25, 0);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors
          metalness={0.6}
          roughness={0.25}
          emissive={"#5b21b6"}
          emissiveIntensity={emissiveIntensity}
          envMapIntensity={0.8}
        />
      </mesh>

      <instancedMesh
        ref={cubesRef}
        args={[undefined, undefined, cubeCount]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          metalness={0.5}
          roughness={0.3}
          emissive={"#3b82f6"}
          emissiveIntensity={emissiveIntensity * 0.7}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Canvas owner                                                               */
/* -------------------------------------------------------------------------- */

export default function VLogoScene({
  variant = "hero",
  className,
}: VLogoSceneProps) {
  const reducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  // Read viewport width once to scale down work on small screens. Safe to read
  // synchronously: this module is only ever loaded client-side (ssr: false), so
  // there is no server render to mismatch against.
  const [isSmall] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );

  const cubeCount = isSmall ? 28 : 52;
  const dprMax = isSmall ? 1.5 : 2;
  const lightBoost = isDark ? 1.15 : 0.85;

  return (
    <Canvas
      className={cn(className)}
      style={{ width: "100%", height: "100%" }}
      dpr={[1, dprMax]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 5], fov: 35 }}
      frameloop={reducedMotion ? "demand" : "always"}
    >
      <ambientLight intensity={0.55 * lightBoost} />
      <directionalLight
        position={[3, 4, 5]}
        intensity={2.2 * lightBoost}
        color={"#a855f7"}
      />
      <directionalLight
        position={[-4, -2, 3]}
        intensity={1.4 * lightBoost}
        color={"#3b82f6"}
      />
      <pointLight position={[0, -3, 2]} intensity={2 * lightBoost} color={"#2563eb"} />

      <VContent
        variant={variant}
        reducedMotion={reducedMotion}
        isDark={isDark}
        cubeCount={cubeCount}
      />

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}
