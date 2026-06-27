"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  withWord?: boolean;
  className?: string;
  wordClassName?: string;
}

/**
 * VibelyTech Logo
 *
 * Inline SVG "V" mark with a blue→violet linearGradient and a few small
 * trailing pixel squares to the upper-left (echoing the brand's pixel-
 * dispersion motif). When `withWord`, follows with "Vibely" + "Tech" wordmark.
 *
 * Each instance derives its gradient id from React's `useId()`, which produces
 * the same value on the server and client — avoiding SVG id collisions when
 * rendered multiple times AND hydration mismatches.
 */
export function Logo({ withWord = false, className, wordClassName }: LogoProps) {
  // Stable, SSR/CSR-consistent unique id (sanitised — useId() emits ":" chars
  // that are invalid in SVG ids / url(#…) references).
  const rawId = useId();
  const gradId = `vt-logo-grad-${rawId.replace(/:/g, "")}`;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* ── V mark ── */}
      <svg
        viewBox="0 0 40 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-auto shrink-0"
        aria-hidden={withWord ? true : undefined}
        role={withWord ? undefined : "img"}
        aria-label={withWord ? undefined : "VibelyTech"}
      >
        <defs>
          <linearGradient
            id={gradId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>

        {/* Trailing pixel squares — upper left dispersion */}
        {/* Large pixel */}
        <rect x="1" y="1" width="5" height="5" rx="0.5" fill={`url(#${gradId})`} opacity="0.65" />
        {/* Medium pixel */}
        <rect x="8" y="0" width="3" height="3" rx="0.5" fill={`url(#${gradId})`} opacity="0.45" />
        {/* Small pixel */}
        <rect x="0" y="8" width="2" height="2" rx="0.5" fill={`url(#${gradId})`} opacity="0.3" />
        {/* Tiny pixel */}
        <rect x="5" y="7" width="1.5" height="1.5" rx="0.25" fill={`url(#${gradId})`} opacity="0.2" />

        {/* Bold "V" chevron — two thick strokes meeting at the bottom center */}
        {/*
          Left arm: from (8, 7) down-right to (20, 34)
          Right arm: from (32, 7) down-left to (20, 34)
          Stroke width ~6, rendered as filled path for crispness
        */}
        <path
          d="M8 7 L20 34 L32 7"
          stroke={`url(#${gradId})`}
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* ── Wordmark ── */}
      {withWord && (
        <span
          className={cn(
            "select-none font-sans leading-none tracking-tight",
            wordClassName,
          )}
          aria-label="VibelyTech"
        >
          <span className="font-bold text-foreground">Vibely</span>
          <span className="font-light text-muted">Tech</span>
        </span>
      )}
    </div>
  );
}
