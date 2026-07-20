"use client";

import { useRef } from "react";

import VLogoCanvas from "@/components/three/VLogoCanvas";
import { Logo } from "@/components/layout/Logo";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useLoader } from "@/providers/LoaderProvider";

/** How long the fake progress takes to crawl 0 → 100 with motion enabled. */
const PROGRESS_DURATION = 1.1;
/** Shorter, snappier crawl when the user prefers reduced motion. */
const PROGRESS_DURATION_REDUCED = 0.4;

/**
 * VibelyTech Preloader — the first-load brand moment.
 *
 * Renders a solid brand-dark overlay IMMEDIATELY (no window/localStorage reads
 * during render, so server and client first paint are identical and there's
 * never a white flash). It drives the loader's fake progress, then plays a
 * GSAP exit reveal when the loader transitions to `exiting`, and unmounts
 * entirely once `done` to free the 3D canvas + stop blocking pointer events.
 */
export default function Preloader() {
  const { phase, progress, reportProgress, markReady, completeExit } =
    useLoader();
  const reducedMotion = useReducedMotion();

  const overlayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  // Guard so markReady fires exactly once, even though the progress tween is
  // re-created when `reducedMotion` resolves (see dependency array below).
  const readySignalledRef = useRef(false);

  // ── Drive fake progress 0 → 100, then signal ready. Re-runs once if the
  // reduced-motion preference resolves to true after first render, so those
  // users get the faster crawl. markReady is guarded to fire only once. ──
  useGSAP(
    () => {
      const proxy = { value: 0 };
      const tween = gsap.to(proxy, {
        value: 100,
        duration: reducedMotion ? PROGRESS_DURATION_REDUCED : PROGRESS_DURATION,
        ease: "power1.inOut",
        onUpdate: () => reportProgress(proxy.value),
        onComplete: () => {
          reportProgress(100);
          if (!readySignalledRef.current) {
            readySignalledRef.current = true;
            markReady();
          }
        },
      });

      return () => {
        tween.kill();
      };
    },
    { scope: overlayRef, dependencies: [reducedMotion] },
  );

  // ── Exit reveal. Re-runs whenever `phase` changes; acts on "exiting". ──
  useGSAP(
    () => {
      if (phase !== "exiting") return;

      if (reducedMotion) {
        // Skip the elaborate choreography — quick fade, then hand back.
        gsap.to(overlayRef.current, {
          autoAlpha: 0,
          duration: 0.3,
          ease: "power1.out",
          onComplete: completeExit,
        });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: completeExit,
      });

      // 1) The V scales up + fades, gaining a little rotation for energy.
      tl.to(stageRef.current, {
        scale: 1.18,
        rotateZ: 6,
        autoAlpha: 0,
        duration: 0.6,
        ease: "power2.in",
      });

      // 2) The progress UI drifts up + fades, overlapping the V exit.
      tl.to(
        uiRef.current,
        { y: -24, autoAlpha: 0, duration: 0.45, ease: "power2.in" },
        "<0.05",
      );

      // 3) The whole panel wipes upward via clip-path, revealing the page.
      tl.fromTo(
        overlayRef.current,
        { clipPath: "inset(0% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 0.9,
          ease: "power4.inOut",
        },
        "-=0.15",
      );
    },
    { scope: overlayRef, dependencies: [phase] },
  );

  // Fully done → unmount so the GPU canvas frees and pointer events flow.
  if (phase === "done") return null;

  const isExiting = phase === "exiting";

  return (
    <div
      ref={overlayRef}
      aria-hidden={isExiting ? true : undefined}
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden",
        isExiting && "pointer-events-none",
      )}
      style={{
        // Theme-aware radial painted immediately — no blank/white flash.
        // Dark: deep navy (var values resolve to #0b1120 → #060912).
        // Light: clean surface → white, so text stays readable in light mode.
        background:
          "radial-gradient(circle at 50% 38%, var(--surface) 0%, var(--background) 75%)",
        willChange: "clip-path, opacity",
      }}
    >
      {/* Faint brand-gradient glow behind the mark. */}
      <div
        aria-hidden
        className="bg-brand-gradient pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
      />

      {/* Center stage: the 3D V. */}
      <div
        ref={stageRef}
        className="relative aspect-square w-[min(60vw,520px)]"
      >
        <VLogoCanvas variant="preloader" />
      </div>

      {/* Wordmark + progress UI. */}
      <div
        ref={uiRef}
        className="relative z-10 -mt-4 flex w-[min(80vw,360px)] flex-col items-center gap-5"
      >
        <Logo withWord className="h-9" />

        {/* Thin progress track + brand-gradient fill. */}
        <div className="h-px w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="bg-brand-gradient h-full rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div
          role="status"
          aria-live="polite"
          className="flex w-full items-center justify-between font-mono text-[0.7rem] uppercase tracking-[0.25em] text-muted"
        >
          <span>Loading experience</span>
          <span className="text-foreground tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}
