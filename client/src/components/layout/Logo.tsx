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
      {/* ── V mark — asymmetric checkmark-V matching the brand mark ──
          Thin/short BLUE left blade with a pixel-dispersion trail off its
          upper-left tip; tall/thick VIOLET right ribbon rendered as a folded
          two-face shape (lighter front + darker side) for a 3D crease. The two
          arms meet at a bottom vertex; one blue→violet diagonal gradient. */}
      <svg
        viewBox="0 0 46 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-auto shrink-0"
        aria-hidden={withWord ? true : undefined}
        role={withWord ? undefined : "img"}
        aria-label={withWord ? undefined : "VibelyTech"}
      >
        <defs>
          {/* Bottom-left (blue) → top-right (violet). */}
          <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="45%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* Pixel-dispersion trail — off the upper-left tip of the blue blade. */}
        <rect x="5.5" y="9" width="4" height="4" rx="0.6" fill={`url(#${gradId})`} opacity="0.85" />
        <rect x="2" y="6" width="3" height="3" rx="0.5" fill={`url(#${gradId})`} opacity="0.6" />
        <rect x="5" y="3.4" width="2.3" height="2.3" rx="0.4" fill={`url(#${gradId})`} opacity="0.45" />
        <rect x="0.6" y="2.2" width="1.7" height="1.7" rx="0.3" fill={`url(#${gradId})`} opacity="0.32" />
        <rect x="9" y="4.6" width="1.5" height="1.5" rx="0.3" fill={`url(#${gradId})`} opacity="0.28" />

        {/* Left blade — thin, shorter, blue end of the gradient. */}
        <path d="M8 15 L12 14 L20.5 33 L16.5 36 Z" fill={`url(#${gradId})`} />

        {/* Right ribbon — tall + thick, folded. Front (lighter) face. */}
        <path d="M18 36 L26 9 L33 6.5 Z" fill={`url(#${gradId})`} />
        {/* Right ribbon — darker side face (gradient + dark overlay = crease). */}
        <path d="M18 36 L33 6.5 L40 5 Z" fill={`url(#${gradId})`} />
        <path d="M18 36 L33 6.5 L40 5 Z" fill="#1e1145" opacity="0.34" />
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
