"use client";

import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary";

interface VLogoCanvasProps {
  variant?: "preloader" | "hero";
  className?: string;
}

/**
 * CSS/SVG "V" in the brand gradient, sized to fill its parent. Shown while the
 * R3F scene chunk loads so there's no blank flash before the 3D logo appears.
 */
function Fallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="h-2/3 w-2/3 max-h-40 max-w-40 animate-float"
        role="img"
        aria-label="VibelyTech"
      >
        <defs>
          <linearGradient id="v-fallback-grad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--brand-blue)" />
            <stop offset="100%" stopColor="var(--brand-violet-bright)" />
          </linearGradient>
        </defs>
        <path
          d="M18 16 L50 84 L82 16 L66 16 L50 54 L34 16 Z"
          fill="url(#v-fallback-grad)"
        />
      </svg>
    </div>
  );
}

const VLogoScene = dynamic(() => import("./VLogoScene"), {
  ssr: false,
  loading: () => <Fallback />,
});

export default function VLogoCanvas({
  variant = "hero",
  className,
}: VLogoCanvasProps) {
  return (
    <div className={cn("relative h-full w-full", className)}>
      {/* If three/WebGL throws, render the same brand-gradient fallback instead
          of letting the error propagate to the route boundary. */}
      <CanvasErrorBoundary fallback={<Fallback />}>
        <VLogoScene variant={variant} />
      </CanvasErrorBoundary>
    </div>
  );
}
