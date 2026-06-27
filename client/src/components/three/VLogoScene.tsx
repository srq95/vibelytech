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

const COLOR_BLUE = new THREE.Color("#2563eb"); // brand blue (blade / lower-left)
const COLOR_VIOLET = new THREE.Color("#a855f7"); // brand violet (ribbon / upper-right)

// The brand gradient runs diagonally: blue at bottom-left, violet at top-right.
const GRAD_DIR = new THREE.Vector2(0.5, 0.86).normalize();

// Combined xy centre of both arm shapes (so the pair sits centred at origin).
const V_CENTER_X = 0.06;
const V_CENTER_Y = 0.06;

// Base scale applied to the whole composition so the (taller, wider-on-the-
// right) V plus its full pixel-cube trail always stay inside the canvas with
// padding — see the framing notes in the canvas owner below.
const BASE_SCALE = 0.56;

/**
 * Paint a blue→violet gradient across a *set* of geometries using a shared
 * diagonal axis + shared min/max, so blue stays bottom-left and violet
 * top-right across BOTH arms (not normalised per-mesh).
 */
function applyDiagonalGradient(geos: THREE.BufferGeometry[]): void {
  let minP = Infinity;
  let maxP = -Infinity;
  for (const g of geos) {
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      const p = pos.getX(i) * GRAD_DIR.x + pos.getY(i) * GRAD_DIR.y;
      if (p < minP) minP = p;
      if (p > maxP) maxP = p;
    }
  }
  const span = maxP - minP || 1;
  const tmp = new THREE.Color();
  for (const g of geos) {
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i += 1) {
      const p = pos.getX(i) * GRAD_DIR.x + pos.getY(i) * GRAD_DIR.y;
      const t = (p - minP) / span;
      tmp.copy(COLOR_BLUE).lerp(COLOR_VIOLET, t);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }
}

interface VGeometries {
  left: THREE.BufferGeometry; // thin, shorter blue blade
  right: THREE.BufferGeometry; // tall, thick violet ribbon
}

/**
 * Procedural asymmetric "V": a thin/short LEFT blade and a tall/thick RIGHT
 * folded ribbon, meeting at a bottom vertex — matching the brand mark. Built as
 * two extruded, bevelled shapes; the right ribbon is extruded deeper so its
 * front/side faces catch light differently (the folded-crease read).
 */
function buildVGeometries(): VGeometries {
  // Left blade — thin parallelogram rising up-left, top ~y0.5 (shorter).
  const leftShape = new THREE.Shape();
  leftShape.moveTo(-1.0, 0.5);
  leftShape.lineTo(-0.62, 0.56);
  leftShape.lineTo(0.04, -0.92);
  leftShape.lineTo(-0.2, -1.04);
  leftShape.closePath();

  // Right ribbon — wider, rising to ~y1.16 (taller) on the right.
  const rightShape = new THREE.Shape();
  rightShape.moveTo(0.16, -0.92);
  rightShape.lineTo(0.5, 1.16);
  rightShape.lineTo(1.12, 0.98);
  rightShape.lineTo(-0.06, -1.04);
  rightShape.closePath();

  const left = new THREE.ExtrudeGeometry(leftShape, {
    depth: 0.26,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 3,
    curveSegments: 6,
  });
  const right = new THREE.ExtrudeGeometry(rightShape, {
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.09,
    bevelSize: 0.07,
    bevelSegments: 4,
    curveSegments: 6,
  });

  // Shared xy centre; centre each arm on its own depth in z.
  left.translate(-V_CENTER_X, -V_CENTER_Y, -0.13);
  right.translate(-V_CENTER_X, -V_CENTER_Y, -0.25);

  applyDiagonalGradient([left, right]);
  return { left, right };
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
    // Resting cluster: a tight trail off the UPPER-LEFT tip of the blue blade
    // (the blade's tip sits near x≈-1.05, y≈0.45 after centring), fanning up-left.
    const tx = -0.9 - Math.random() * 0.55; // -0.90 … -1.45
    const ty = 0.35 + Math.random() * 0.75; // 0.35 … 1.10
    const tz = (Math.random() - 0.5) * 0.5;
    targets[i * 3] = tx;
    targets[i * 3 + 1] = ty;
    targets[i * 3 + 2] = tz;

    // Assembly origin: BOUNDED offset toward the up-left so cubes fly in from
    // the dispersion direction and never leave the frame mid-flight.
    const angle = Math.PI * 0.75 + (Math.random() - 0.5) * Math.PI * 0.6;
    const radius = 0.55 + Math.random() * 0.6; // 0.55 … 1.15
    starts[i * 3] = tx + Math.cos(angle) * radius;
    starts[i * 3 + 1] = ty + Math.sin(angle) * radius;
    starts[i * 3 + 2] = tz + (Math.random() - 0.5) * 0.8;

    seeds[i] = Math.random();
    sizes[i] = 0.045 + Math.random() * 0.06;
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

  const geometry = useMemo(() => buildVGeometries(), []);
  const cubes = useMemo(() => buildCubes(cubeCount), [cubeCount]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  const emissiveIntensity = isDark ? 0.55 : 0.28;

  // Dispose procedural geometry on unmount.
  useEffect(() => {
    const { left, right } = geometry;
    return () => {
      left.dispose();
      right.dispose();
    };
  }, [geometry]);

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
      // Pixel trail reads as the blue end of the brand gradient (only a hint of
      // violet) — it lives at the blue/lower-left tip in the real mark.
      tmpColor.copy(COLOR_BLUE).lerp(COLOR_VIOLET, cubes.seeds[i] * 0.35);
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
      // Amplitudes kept small + bounded so the tall right arm and cube trail
      // never rotate/drift out of the (already padded) frame.
      if (group) {
        const targetRotY = state.pointer.x * 0.26;
        const targetRotX = -state.pointer.y * 0.18;
        group.rotation.y += (targetRotY - group.rotation.y) * Math.min(delta * 2.5, 1);
        group.rotation.x += (targetRotX - group.rotation.x) * Math.min(delta * 2.5, 1);
        group.position.y = Math.sin(t * 0.8) * 0.07;
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
    // Outer group holds the fixed framing scale; inner group is animated
    // (assemble / float / parallax) so amplitudes compose cleanly on top.
    <group scale={BASE_SCALE}>
      <group ref={groupRef}>
        <mesh geometry={geometry.left} castShadow receiveShadow>
          <meshStandardMaterial
            vertexColors
            metalness={0.55}
            roughness={0.28}
            emissive={"#1d4ed8"}
            emissiveIntensity={emissiveIntensity}
            envMapIntensity={0.8}
          />
        </mesh>
        <mesh geometry={geometry.right} castShadow receiveShadow>
          <meshStandardMaterial
            vertexColors
            metalness={0.6}
            roughness={0.25}
            emissive={"#5b21b6"}
            emissiveIntensity={emissiveIntensity}
            envMapIntensity={0.85}
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
      // Pulled back + narrower FOV (with BASE_SCALE on the group) so the full
      // asymmetric V and the entire pixel-cube trail keep a comfortable margin
      // inside the square canvas at every frame of both variants.
      camera={{ position: [0, 0, 5.6], fov: 34 }}
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
