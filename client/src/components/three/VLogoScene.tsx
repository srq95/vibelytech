"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import { useTheme } from "next-themes";
import * as THREE from "three";
import {
  SVGLoader,
  type SVGResult,
} from "three/examples/jsm/loaders/SVGLoader.js";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

type Variant = "preloader" | "hero";

interface VLogoSceneProps {
  variant?: Variant;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/* Brand mark — inlined SVG (source of truth: public/brand/vibelytech-mark.svg)*/
/* Parsed with SVGLoader so there is no network fetch / Suspense boundary.     */
/* -------------------------------------------------------------------------- */

const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="34 30 307 246">
  <defs>
    <linearGradient id="vt-fav-1" x1="154.01" y1="185.91" x2="200.17" y2="114.71" gradientUnits="userSpaceOnUse">
      <stop offset=".13" stop-color="#1e7bfe"/>
      <stop offset="1" stop-color="#8133f2"/>
    </linearGradient>
    <linearGradient id="vt-fav-2" x1="100.83" y1="81.73" x2="213.18" y2="255.41" gradientUnits="userSpaceOnUse">
      <stop offset=".53" stop-color="#1e7bfe" stop-opacity="0"/>
      <stop offset="1" stop-color="#4a2fde"/>
    </linearGradient>
    <linearGradient id="vt-fav-3" x1="77.53" y1="1761.36" x2="87.72" y2="1761.36" gradientTransform="translate(0 1888.31) scale(1 -1)" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#6c2df7"/>
      <stop offset="1" stop-color="#8133f2"/>
    </linearGradient>
  </defs>
  <rect x="54.77" y="34.1" width="12.6" height="13.2" fill="#1b7dff"/>
  <polygon points="336.47 62.1 238.47 227.8 235.87 227.8 232.57 222 201.87 168.2 215.57 144.4 256.87 73.1 336.47 62.1" fill="#7734e4"/>
  <polygon points="234.17 223.1 232.57 222 201.87 168.2 215.57 144.4 216.37 144.9 234.17 223.1" fill="#5824c7"/>
  <path d="m222.47,221.5l-88.4-149.3h-16.8v7.7h-8.4l-1,10.8h21.2v22.1h-21.2v-22.1l-6.2,22.1v15.1h14.6v13.9h-14.6l69.2,114.9,41.9,14.2,25.7-43.1-16-6.3Zm-89.6-133.2h-9.3v-9.7h9.3v9.7Z" fill="url(#vt-fav-1)"/>
  <polygon points="222.47 221.5 184.65 157.63 111.2 157.63 170.87 256.7 212.77 270.9 238.47 227.8 222.47 221.5" fill="url(#vt-fav-2)"/>
  <rect x="38.97" y="69.2" width="10.2" height="10.7" fill="#75b0e8"/>
  <rect x="77.57" y="121.6" width="10.2" height="10.7" fill="url(#vt-fav-3)"/>
  <rect x="57.77" y="80.3" width="19.8" height="20.7" fill="#1b7dff"/>
  <rect x="87.77" y="90.7" width="21.2" height="22.2" fill="#1b7dff"/>
  <polygon points="108.87 65.3 108.87 72.2 86.77 72.2 86.77 57.2 101.77 57.2 101.77 65.3 108.87 65.3" fill="#1b7dff"/>
</svg>`;

/* Blade gradient endpoints (SVGLoader can't resolve url(...) fills). */
const BLADE_BLUE = new THREE.Color("#1e7bfe"); // V point (bottom)
const BLADE_VIOLET = new THREE.Color("#8133f2"); // toward the top
const PIXEL_GRAD_VIOLET = new THREE.Color("#7730f5"); // avg of url(#vt-fav-3)

const EXTRUDE_OPTS: THREE.ExtrudeGeometryOptions = {
  depth: 24,
  bevelEnabled: true,
  bevelThickness: 2.6,
  bevelSize: 1.8,
  bevelSegments: 2,
  curveSegments: 6,
};

/** Fraction of the smaller viewport dimension the whole mark (incl. the full
 *  range of pixel motion) is allowed to occupy — leaves padding so nothing
 *  clips while floating / rotating. */
// Per-variant fill fraction of the smaller viewport dimension.
// The normalized layout reserves room for the pixels' *scattered* start —
// which only the preloader uses. In the hero the pixels merely drift, so the
// V can be drawn much larger without clipping.
const FIT_PRELOADER = 0.82;
const FIT_HERO = 1.3;

/* -------------------------------------------------------------------------- */
/* Deterministic PRNG so framing (which depends on the scatter targets) is     */
/* identical across mounts and both variants.                                  */
/* -------------------------------------------------------------------------- */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* -------------------------------------------------------------------------- */
/* Mark construction                                                          */
/* -------------------------------------------------------------------------- */

interface SvgFillStyle {
  fill?: string;
}

interface CoreDesc {
  geometry: THREE.BufferGeometry;
  color: THREE.Color;
  vertexColors: boolean;
}

interface PixelDesc {
  geometry: THREE.BufferGeometry; // centred on its own centroid
  rest: THREE.Vector3; // resting centre, raw SVG coords (z = 0)
  scatter: THREE.Vector3; // offset to the pre-assembly scattered start
  color: THREE.Color;
  seed: number;
}

interface Mark {
  core: CoreDesc[];
  pixels: PixelDesc[];
  center: THREE.Vector3; // combined centre (raw SVG coords)
  normScale: number; // 1 / maxDim → normalises the whole layout to ~1 unit
}

/** Paint a blue→violet gradient onto blade vertices along the SVG Y axis
 *  (larger SVG-y = the V point = blue; smaller SVG-y = top = violet). */
function applyBladeGradient(geo: THREE.BufferGeometry): void {
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  if (!bb) return;
  const minY = bb.min.y;
  const spanY = bb.max.y - bb.min.y || 1;
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i += 1) {
    const t = (pos.getY(i) - minY) / spanY; // 0 = top(violet), 1 = bottom(blue)
    tmp.copy(BLADE_VIOLET).lerp(BLADE_BLUE, t);
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
}

function classify(fill: string): "blade" | "pixel" | "skip" | "core" {
  const f = fill.toLowerCase();
  if (f.includes("vt-fav-2")) return "skip"; // 2D shading overlay — not needed in 3D
  if (f.includes("vt-fav-1")) return "blade";
  if (f.includes("vt-fav-3") || f.includes("1b7dff") || f.includes("75b0e8")) {
    return "pixel";
  }
  return "core";
}

function buildMark(): Mark {
  const parsed: SVGResult = new SVGLoader().parse(MARK_SVG);
  const rng = mulberry32(0x5eed);

  const core: CoreDesc[] = [];
  const pixels: Omit<PixelDesc, "scatter">[] = [];

  // First pass: build geometry, classify, gather rest layout.
  for (const path of parsed.paths) {
    const style = path.userData.style as SvgFillStyle | undefined;
    const fill = style?.fill ?? "";
    const kind = classify(fill);
    if (kind === "skip") continue;

    const shapes = path.toShapes();
    if (shapes.length === 0) continue;

    const geo = new THREE.ExtrudeGeometry(shapes, EXTRUDE_OPTS);
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    if (!bb) continue;
    // Straddle z = 0 so rotation looks balanced.
    const zc = (bb.min.z + bb.max.z) / 2;

    if (kind === "pixel") {
      const c = new THREE.Vector3();
      bb.getCenter(c);
      geo.translate(-c.x, -c.y, -zc); // centre on centroid
      const color =
        fill.toLowerCase().includes("vt-fav-3")
          ? PIXEL_GRAD_VIOLET.clone()
          : path.color.clone();
      pixels.push({
        geometry: geo,
        rest: new THREE.Vector3(c.x, c.y, 0),
        color,
        seed: rng(),
      });
    } else {
      geo.translate(0, 0, -zc);
      if (kind === "blade") applyBladeGradient(geo);
      core.push({
        geometry: geo,
        color: kind === "blade" ? BLADE_BLUE.clone() : path.color.clone(),
        vertexColors: kind === "blade",
      });
    }
  }

  // Mark centre (from the solid V core) — used to aim the scatter outward.
  const coreBox = new THREE.Box3();
  for (const c of core) {
    c.geometry.computeBoundingBox();
    if (c.geometry.boundingBox) coreBox.union(c.geometry.boundingBox);
  }
  const coreCenter = new THREE.Vector3();
  coreBox.getCenter(coreCenter);

  // Assign each pixel a scattered start: pushed outward (biased up-left, the
  // direction of the mark's real dispersion trail) plus a little depth.
  const dir = new THREE.Vector3();
  const pixelsFull: PixelDesc[] = pixels.map((p) => {
    dir.set(p.rest.x - coreCenter.x, p.rest.y - coreCenter.y, 0);
    if (dir.lengthSq() < 1e-3) dir.set(-1, -1, 0);
    dir.normalize();
    const dist = 46 + rng() * 46;
    const scatter = new THREE.Vector3(
      dir.x * dist - 14 - rng() * 18, // extra left  (−x)
      dir.y * dist - 14 - rng() * 18, // extra up    (−y in SVG space)
      (rng() - 0.5) * 70,
    );
    return { ...p, scatter };
  });

  // Framing box: core + every pixel at BOTH rest and scattered start, so the
  // mark plus the full range of motion always fits the frame.
  const box = new THREE.Box3();
  for (const c of core) {
    c.geometry.computeBoundingBox();
    if (c.geometry.boundingBox) box.union(c.geometry.boundingBox);
  }
  const half = new THREE.Vector3();
  for (const p of pixelsFull) {
    p.geometry.computeBoundingBox();
    const pb = p.geometry.boundingBox;
    if (!pb) continue;
    pb.getSize(half).multiplyScalar(0.5);
    // rest extent
    box.expandByPoint(
      new THREE.Vector3(p.rest.x - half.x, p.rest.y - half.y, 0),
    );
    box.expandByPoint(
      new THREE.Vector3(p.rest.x + half.x, p.rest.y + half.y, 0),
    );
    // scattered-start extent
    const s = p.rest.clone().add(p.scatter);
    box.expandByPoint(new THREE.Vector3(s.x - half.x, s.y - half.y, 0));
    box.expandByPoint(new THREE.Vector3(s.x + half.x, s.y + half.y, 0));
  }

  const center = new THREE.Vector3();
  box.getCenter(center);
  center.z = 0;
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y) || 1;

  return { core, pixels: pixelsFull, center, normScale: 1 / maxDim };
}

/* -------------------------------------------------------------------------- */
/* Easing + animation constants                                               */
/* -------------------------------------------------------------------------- */

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

const ASSEMBLE_DURATION = 0.9;
const STAGGER_WINDOW = 0.75;
const INTRO_DURATION = 1.3;

/* -------------------------------------------------------------------------- */
/* Scene content (inside the Canvas)                                          */
/* -------------------------------------------------------------------------- */

interface VContentProps {
  variant: Variant;
  reducedMotion: boolean;
  isDark: boolean;
}

function VContent({ variant, reducedMotion, isDark }: VContentProps) {
  const rootRef = useRef<THREE.Group>(null);
  const pixelRefs = useRef<(THREE.Mesh | null)[]>([]);

  const mark = useMemo(() => buildMark(), []);
  const viewport = useThree((s) => s.viewport);

  const emissiveIntensity = isDark ? 0.32 : 0.16;

  // Base fit scale (normalised layout is ~1 unit across).
  const fitFraction = variant === "hero" ? FIT_HERO : FIT_PRELOADER;
  const fitScale = Math.min(viewport.width, viewport.height) * fitFraction;

  const { normScale: N, center: C } = mark;

  // Dispose the extruded geometry when this instance unmounts.
  useEffect(() => {
    return () => {
      mark.core.forEach((c) => c.geometry.dispose());
      mark.pixels.forEach((p) => p.geometry.dispose());
    };
  }, [mark]);

  const animate = !reducedMotion;
  const assembleOnMount = animate && variant === "preloader";

  useFrame((state, delta) => {
    if (!animate) return;
    const t = state.clock.elapsedTime;
    const root = rootRef.current;
    const fit =
      Math.min(state.viewport.width, state.viewport.height) * fitFraction;

    if (variant === "preloader") {
      const intro = easeOutCubic(Math.min(t / INTRO_DURATION, 1));
      if (root) {
        root.scale.setScalar(fit * (0.62 + 0.38 * intro));
        root.rotation.y = (1 - intro) * 1.5 + t * 0.14;
        root.rotation.x = (1 - intro) * 0.28;
        root.position.set(0, 0, 0);
      }
      for (let i = 0; i < mark.pixels.length; i += 1) {
        const mesh = pixelRefs.current[i];
        if (!mesh) continue;
        const p = mark.pixels[i];
        const local = (t - p.seed * STAGGER_WINDOW) / ASSEMBLE_DURATION;
        const e = easeOutCubic(Math.max(0, Math.min(local, 1)));
        const k = 1 - e;
        mesh.position.set(
          p.rest.x + p.scatter.x * k,
          p.rest.y + p.scatter.y * k,
          p.rest.z + p.scatter.z * k,
        );
        mesh.scale.setScalar(e);
        mesh.rotation.set(
          (p.seed * 6 + t * 0.9) * k,
          (p.seed * 4 + t * 0.7) * k,
          0,
        );
      }
    } else {
      // Hero: calm float + subtle pointer parallax; pixels drift gently.
      if (root) {
        const targetRotY = state.pointer.x * 0.3;
        const targetRotX = -state.pointer.y * 0.22;
        const lerp = Math.min(delta * 2.5, 1);
        root.rotation.y += (targetRotY - root.rotation.y) * lerp;
        root.rotation.x += (targetRotX - root.rotation.x) * lerp;
        root.position.set(0, Math.sin(t * 0.7) * 0.035 * fit, 0);
        root.scale.setScalar(fit);
      }
      for (let i = 0; i < mark.pixels.length; i += 1) {
        const mesh = pixelRefs.current[i];
        if (!mesh) continue;
        const p = mark.pixels[i];
        const s = p.seed;
        mesh.position.set(
          p.rest.x + Math.sin(t * 0.6 + s * 9) * 5,
          p.rest.y + Math.cos(t * 0.5 + s * 7) * 5,
          p.rest.z + Math.sin(t * 0.4 + s * 5) * 6,
        );
        mesh.rotation.set(
          Math.sin(t * 0.3 + s * 3) * 0.15,
          Math.cos(t * 0.25 + s * 4) * 0.15,
          0,
        );
        mesh.scale.setScalar(1);
      }
    }
  });

  const initialPixelScale = assembleOnMount ? 0 : 1;

  return (
    <group ref={rootRef} scale={fitScale}>
      {/* Centre + flip (SVG is Y-down) + normalise to ~1 unit. */}
      <group scale={[N, -N, N]} position={[-N * C.x, N * C.y, 0]}>
        {mark.core.map((c, i) => (
          <mesh key={`core-${i}`} geometry={c.geometry}>
            <meshStandardMaterial
              vertexColors={c.vertexColors}
              color={c.vertexColors ? undefined : c.color}
              metalness={0.42}
              roughness={0.26}
              emissive={c.color}
              emissiveIntensity={emissiveIntensity}
              envMapIntensity={0.85}
            />
          </mesh>
        ))}

        {mark.pixels.map((p, i) => (
          <mesh
            key={`px-${i}`}
            ref={(m) => {
              pixelRefs.current[i] = m;
            }}
            geometry={p.geometry}
            position={p.rest}
            scale={initialPixelScale}
          >
            <meshStandardMaterial
              color={p.color}
              metalness={0.45}
              roughness={0.28}
              emissive={p.color}
              emissiveIntensity={emissiveIntensity * 1.4}
            />
          </mesh>
        ))}
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
  const isSmall =
    typeof window !== "undefined" && window.innerWidth < 768;

  const dprMax = isSmall ? 1.5 : 2;
  const lightBoost = isDark ? 1.15 : 0.9;

  return (
    <Canvas
      className={cn(className)}
      style={{ width: "100%", height: "100%" }}
      dpr={[1, dprMax]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 5], fov: 35 }}
      frameloop={reducedMotion ? "demand" : "always"}
    >
      <ambientLight intensity={0.6 * lightBoost} />
      <directionalLight
        position={[3, 4, 5]}
        intensity={2.1 * lightBoost}
        color={"#8133f2"}
      />
      <directionalLight
        position={[-4, -1, 3]}
        intensity={1.4 * lightBoost}
        color={"#1e7bfe"}
      />
      <pointLight position={[0, -3, 2]} intensity={1.8 * lightBoost} color={"#1e7bfe"} />

      <VContent variant={variant} reducedMotion={reducedMotion} isDark={isDark} />

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}
