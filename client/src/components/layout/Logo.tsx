"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Render the full brand lockup (mark + wordmark). When false, just the mark. */
  withWord?: boolean;
  className?: string;
}

/**
 * VibelyTech Logo
 *
 * `withWord` renders the COMPLETE official brand lockup (mark + "VibelyTech"
 * wordmark + tagline) straight from the supplied SVG artwork, theme-swapped:
 * the dark-ink lockup on light backgrounds, the white-ink lockup on dark.
 * Both files ship in `public/brand/`; the inactive one is `display:none` so
 * screen readers only announce the visible one. Swapping via CSS (`.dark`)
 * means no JS and no flash.
 *
 * `withWord={false}` renders just the inline "V" mark (icon) — geometry lifted
 * verbatim from the brand SVG, with a `useId()` gradient id to avoid SVG id
 * collisions / hydration mismatches when several render on one page.
 */
export function Logo({ withWord = false, className }: LogoProps) {
  if (withWord) {
    return (
      // Height lives on the wrapper (default h-8, override via className); the
      // images fill it, so callers size the whole lockup with one class.
      <span className={cn("flex h-8 shrink-0 items-center", className)}>
        {/* Light background → dark-ink lockup.
            Plain <img>: a vector logo gains nothing from next/image raster
            optimization, and this avoids needing intrinsic width/height. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/vibelytech-logo-on-light.svg"
          alt="VibelyTech — Digital Agency"
          className="block h-full w-auto dark:hidden"
        />
        {/* Dark background → white-ink lockup */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/vibelytech-logo-on-dark.svg"
          alt="VibelyTech — Digital Agency"
          className="hidden h-full w-auto dark:block"
        />
      </span>
    );
  }

  return <LogoMark className={className} />;
}

/**
 * Inline "V" mark (icon-only) — exact brand geometry.
 *
 * Exported so every "V" in the UI (icons, decorative watermarks) uses the real
 * mark with its pixel-dispersion elements, rather than a text "V" glyph.
 * Size it with `className` (e.g. `w-[42vw] h-auto opacity-5`).
 */
export function LogoMark({ className }: { className?: string }) {
  const rawId = useId();
  const gradId = `vt-logo-grad-${rawId.replace(/:/g, "")}`;

  return (
    <svg
      viewBox="34 30 307 246"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-auto shrink-0", className)}
      role="img"
      aria-label="VibelyTech"
    >
      <defs>
        <linearGradient
          id={`${gradId}-1`}
          x1="154.01"
          y1="185.91"
          x2="200.17"
          y2="114.71"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".13" stopColor="#1e7bfe" />
          <stop offset="1" stopColor="#8133f2" />
        </linearGradient>
        <linearGradient
          id={`${gradId}-2`}
          x1="100.83"
          y1="81.73"
          x2="213.18"
          y2="255.41"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".53" stopColor="#1e7bfe" stopOpacity="0" />
          <stop offset="1" stopColor="#4a2fde" />
        </linearGradient>
        <linearGradient
          id={`${gradId}-3`}
          x1="77.53"
          y1="1761.36"
          x2="87.72"
          y2="1761.36"
          gradientTransform="translate(0 1888.31) scale(1 -1)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#6c2df7" />
          <stop offset="1" stopColor="#8133f2" />
        </linearGradient>
      </defs>
      <rect x="54.77" y="34.1" width="12.6" height="13.2" fill="#1b7dff" />
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
        fill={`url(#${gradId}-1)`}
      />
      <polygon
        points="222.47 221.5 184.65 157.63 111.2 157.63 170.87 256.7 212.77 270.9 238.47 227.8 222.47 221.5"
        fill={`url(#${gradId}-2)`}
      />
      <rect x="38.97" y="69.2" width="10.2" height="10.7" fill="#75b0e8" />
      <rect x="77.57" y="121.6" width="10.2" height="10.7" fill={`url(#${gradId}-3)`} />
      <rect x="57.77" y="80.3" width="19.8" height="20.7" fill="#1b7dff" />
      <rect x="87.77" y="90.7" width="21.2" height="22.2" fill="#1b7dff" />
      <polygon
        points="108.87 65.3 108.87 72.2 86.77 72.2 86.77 57.2 101.77 57.2 101.77 65.3 108.87 65.3"
        fill="#1b7dff"
      />
    </svg>
  );
}
