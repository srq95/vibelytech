"use client";

import { useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type MarqueeVariant = "display" | "label";

interface MarqueeProps {
  items: string[];
  reverse?: boolean;
  className?: string;
  /** "display" = big alternating filled/outlined words; "label" = compact filled caps. */
  variant?: MarqueeVariant;
  /** Seconds for one full loop at rest. Lower = faster. */
  speed?: number;
}

/**
 * Scroll-reactive marquee row.
 *
 * Motion is driven by a single seamless GSAP `xPercent` loop (two identical
 * groups, animated by exactly one group width). A per-frame ticker reads the
 * global Lenis scroll velocity and:
 *   - modulates the tween's `timeScale` (faster while flicking, ~0.18 on hover),
 *   - applies a velocity-driven `skewX` shear that eases back to 0 at rest.
 *
 * Reduced motion → static, no skew, fully legible. The duplicate group is
 * `aria-hidden`, so assistive tech reads the items exactly once.
 */
export function Marquee({
  items,
  reverse = false,
  className,
  variant = "label",
  speed = 40,
}: MarqueeProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const velRef = useRef(0);
  const hoverRef = useRef(false);

  // Read velocity off the global Lenis instance (never create a new one).
  useLenis((lenis) => {
    velRef.current = lenis.velocity;
  });

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const direction = reverse ? 1 : -1;

        const loop = gsap.fromTo(
          track,
          { xPercent: reverse ? -50 : 0 },
          {
            xPercent: reverse ? 0 : -50,
            ease: "none",
            duration: speed,
            repeat: -1,
          },
        );

        let skew = 0;

        const update = () => {
          const v = velRef.current;
          const abs = Math.abs(v);

          // Speed reacts to scroll velocity; hover slows it right down.
          const targetScale = hoverRef.current
            ? 0.18
            : 1 + Math.min(abs / 20, 5);
          loop.timeScale(
            gsap.utils.interpolate(loop.timeScale(), targetScale, 0.08),
          );

          // Velocity-driven shear that eases back to 0 when scrolling settles.
          const targetSkew = gsap.utils.clamp(-8, 8, (v * direction) / 8);
          skew = gsap.utils.interpolate(skew, targetSkew, 0.1);
          gsap.set(track, { skewX: skew });

          // Decay so the effect relaxes once Lenis stops emitting.
          velRef.current *= 0.9;
        };

        gsap.ticker.add(update);

        return () => {
          gsap.ticker.remove(update);
          loop.kill();
          gsap.set(track, { clearProps: "transform" });
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(track, { xPercent: reverse ? -50 : 0, skewX: 0 });
      });

      return () => mm.revert();
    },
    { scope: scopeRef },
  );

  return (
    <div
      ref={scopeRef}
      className={cn("relative overflow-hidden", className)}
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
      }}
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
      }}
    >
      <div
        ref={trackRef}
        className="flex w-max flex-nowrap will-change-transform"
      >
        <MarqueeGroup items={items} variant={variant} />
        <MarqueeGroup items={items} variant={variant} hidden />
      </div>
    </div>
  );
}

function MarqueeGroup({
  items,
  variant,
  hidden = false,
}: {
  items: string[];
  variant: MarqueeVariant;
  hidden?: boolean;
}) {
  const isDisplay = variant === "display";

  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center"
    >
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="flex shrink-0 items-center">
          <span
            className={cn(
              "marquee-word select-none whitespace-nowrap",
              isDisplay
                ? "px-[0.35em] text-[clamp(2.25rem,7vw,5rem)] font-black leading-none tracking-tight"
                : "px-[0.7em] font-mono text-[clamp(0.85rem,2.2vw,1.3rem)] font-semibold uppercase tracking-[0.22em]",
              // Alternate filled/outlined on the display row for rhythm;
              // label rows stay filled gradient throughout.
              isDisplay && i % 2 === 1 ? "marquee-stroke" : "text-gradient",
            )}
          >
            {item}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "block shrink-0 rotate-45 rounded-[2px] bg-brand-gradient",
              isDisplay ? "h-2.5 w-2.5" : "h-1.5 w-1.5 opacity-70",
            )}
          />
        </li>
      ))}
    </ul>
  );
}
