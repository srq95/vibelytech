"use client";

import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary";

interface VLogoCanvasProps {
  variant?: "preloader" | "hero";
  className?: string;
}

/**
 * Static SVG of the real brand mark, sized to fill its parent. Shown while the
 * R3F scene chunk loads so there's no blank flash before the 3D logo appears.
 * Mirrors public/brand/vibelytech-mark.svg so the fallback matches the 3D V.
 */
function Fallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg
        viewBox="34 30 307 246"
        className="h-2/3 w-2/3 max-h-48 max-w-48 animate-float"
        role="img"
        aria-label="VibelyTech"
      >
        <defs>
          <linearGradient
            id="vt-fb-1"
            x1="154.01"
            y1="185.91"
            x2="200.17"
            y2="114.71"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset=".13" stopColor="#1e7bfe" />
            <stop offset="1" stopColor="#8133f2" />
          </linearGradient>
        </defs>
        <polygon
          points="336.47 62.1 238.47 227.8 235.87 227.8 232.57 222 201.87 168.2 215.57 144.4 256.87 73.1 336.47 62.1"
          fill="#7734e4"
        />
        <polygon
          points="234.17 223.1 232.57 222 201.87 168.2 215.57 144.4 216.37 144.9 234.17 223.1"
          fill="#5824c7"
        />
        <path
          d="m222.47,221.5l-88.4-149.3h-16.8v7.7h-8.4l-1,10.8h21.2v22.1h-21.2v-22.1l-6.2,22.1v15.1h14.6v13.9h-14.6l69.2,114.9,41.9,14.2,25.7-43.1-16-6.3Zm-89.6-133.2h-9.3v-9.7h9.3v9.7Z"
          fill="url(#vt-fb-1)"
        />
        <rect x="54.77" y="34.1" width="12.6" height="13.2" fill="#1b7dff" />
        <rect x="38.97" y="69.2" width="10.2" height="10.7" fill="#75b0e8" />
        <rect x="77.57" y="121.6" width="10.2" height="10.7" fill="#7730f5" />
        <rect x="57.77" y="80.3" width="19.8" height="20.7" fill="#1b7dff" />
        <rect x="87.77" y="90.7" width="21.2" height="22.2" fill="#1b7dff" />
        <polygon
          points="108.87 65.3 108.87 72.2 86.77 72.2 86.77 57.2 101.77 57.2 101.77 65.3 108.87 65.3"
          fill="#1b7dff"
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
