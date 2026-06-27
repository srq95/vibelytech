"use client";

import { useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Wires the live Lenis instance into the GSAP ticker.
 *
 * This MUST live inside <ReactLenis> so `useLenis()` resolves to the instance
 * via context. Crucially it depends on `[lenis]`, so when Lenis finishes
 * mounting (or is recreated on Fast Refresh / StrictMode remount) the effect
 * re-runs and (re)drives `lenis.raf`. The previous ref-based, run-once wiring
 * could read a null instance and never retry — leaving `autoRaf:false` Lenis
 * with no rAF, so the wheel was intercepted but scroll never advanced (only
 * dragging the native scrollbar worked).
 */
function LenisGsapSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const update = (time: number) => {
      // GSAP ticker time is in seconds; Lenis expects milliseconds.
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(update);
    };
  }, [lenis]);

  return null;
}

/**
 * Single global Lenis instance for the whole app.
 *
 * Lenis's internal rAF is disabled (`autoRaf: false`); the GSAP ticker drives
 * it (see {@link LenisGsapSync}) so smooth scroll and ScrollTrigger stay in
 * sync. The instance is exposed via `useLenis()` (re-exported below) so other
 * providers/components can stop/start it.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ autoRaf: false }}>
      <LenisGsapSync />
      {children}
    </ReactLenis>
  );
}

export { useLenis } from "lenis/react";
