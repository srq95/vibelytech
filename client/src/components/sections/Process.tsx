"use client";

import { useState, useRef } from "react";
import { processSteps } from "@/content/process";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GradientText } from "@/components/ui/GradientText";
import { CodeWindow } from "@/components/ui/CodeWindow";
import { Reveal } from "@/components/ui/Reveal";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * Process section — pinned, scroll-driven "how we work" walkthrough.
 *
 * Layout:
 *   LEFT  — vertical list of processSteps with a brand-gradient rail. The active
 *            step brightens; inactive steps are muted.
 *   RIGHT — editor visual: a CodeWindow showing the active step's .code line,
 *            flanked by a large faded gradient index number + step dots.
 *
 * Scroll mechanics (desktop ≥ 768px + prefers-reduced-motion: no-preference):
 *   The grid wrapper PINS to the viewport ("top top") for ~one viewport of
 *   scroll per step, so each step gets even, deliberate dwell. The pin's
 *   `progress` drives everything:
 *     • rail fill   — scaleY = progress (continuous, smooth);
 *     • active step — progress mapped to an even index with a small dead-zone
 *                     at each end so entering / leaving isn't snappy and the
 *                     first/last steps get a little dwell.
 *   State is set ONLY inside ScrollTrigger callbacks (never the effect body),
 *   and setActiveStep only fires when the computed index actually changes.
 *
 * Fallback (mobile < 768px OR prefers-reduced-motion: reduce): no pin. The same
 * DOM degrades into a normal, fully-visible vertical stack — every step shown
 * active/legible, rail fully filled, editor on the final step. This is the
 * DEFAULT (non-JS) state, so nothing breaks if the pin branch never runs.
 */
export default function Process() {
  const [activeStep, setActiveStep] = useState(0);
  const [pinActive, setPinActive] = useState(false);
  const reducedMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const railFillRef = useRef<HTMLDivElement>(null);
  const lastIndexRef = useRef(0);

  useGSAP(
    () => {
      const pin = pinRef.current;
      if (!pin) return;

      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const fill = railFillRef.current;
          const n = processSteps.length;

          // Map the pin progress (0→1) to state. Called from ScrollTrigger
          // callbacks (onRefresh/onUpdate) — NOT the effect body — so the
          // React Compiler "set-state-in-effect" rule stays happy.
          const apply = (progress: number) => {
            setPinActive(true);

            // Rail fill: continuous, fills fully by the end.
            if (fill) gsap.set(fill, { scaleY: progress });

            // Small dead-zone (5%) at each end → gentle entry/exit + a touch of
            // dwell on the first and last steps. Even thresholds in between.
            const eased = gsap.utils.clamp(
              0,
              1,
              gsap.utils.mapRange(0.05, 0.95, 0, 1, progress),
            );
            const idx = Math.min(n - 1, Math.floor(eased * n));

            if (idx !== lastIndexRef.current) {
              lastIndexRef.current = idx;
              setActiveStep(idx);
            }
          };

          const st = ScrollTrigger.create({
            trigger: pin,
            start: "top top",
            // ~one viewport-worth of scroll per step → even, deliberate pacing.
            end: () => "+=" + window.innerHeight * n,
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: (self) => apply(self.progress),
            onUpdate: (self) => apply(self.progress),
          });

          return () => {
            st.kill();
            // Restore the fully-visible fallback state when the query unmatches.
            setPinActive(false);
            lastIndexRef.current = 0;
            setActiveStep(0);
            if (fill) gsap.set(fill, { clearProps: "transform" });
          };
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  // Fallback (mobile / reduced-motion / before the pin branch runs): every step
  // reads as active so the section is fully usable without scroll.
  const allActive = reducedMotion || !pinActive;

  function isActive(i: number): boolean {
    return allActive || activeStep === i;
  }

  // In the fallback the left list shows every step active, so the editor pins to
  // the LAST step instead of being stuck on step 01 — keeping the columns coherent.
  const displayedIndex = allActive ? processSteps.length - 1 : activeStep;
  const current = processSteps[displayedIndex];

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative overflow-hidden"
    >
      {/* Decorative brand glow — right side */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute right-0 top-1/2 h-[55vw] w-[55vw] max-h-[600px] max-w-[600px] -translate-y-1/2 translate-x-1/3 rounded-full bg-brand-gradient opacity-[0.06] blur-[110px] dark:opacity-[0.13]" />
      </div>

      {/* ── Heading (scrolls normally above the pinned grid) ──────────────────── */}
      <Container className="pt-24 md:pt-32">
        <Reveal>
          <SectionHeading
            eyebrow="// how we work"
            title={
              <>
                From idea to <GradientText>impact</GradientText>
              </>
            }
            description="A focused four-step process that turns your vision into a live, growing product — with craft and intention at every stage."
          />
        </Reveal>
      </Container>

      {/* ── Pin wrapper ───────────────────────────────────────────────────────
          Fallback: a normal padded block (the grid below stacks/lays out and is
          fully visible). On desktop + motion it becomes a full-height, vertically
          centered region that ScrollTrigger pins to the viewport. */}
      <div
        ref={pinRef}
        className={cn(
          "relative mt-12 pb-24 md:mt-16 md:pb-32",
          "motion-safe:md:flex motion-safe:md:min-h-screen motion-safe:md:items-center motion-safe:md:pb-0",
        )}
      >
        <Container className="w-full">
          {/* ── Two-column layout ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 items-start gap-y-12 lg:grid-cols-2 lg:items-center lg:gap-x-16">

            {/* ── LEFT: step list + animated rail ─────────────────────────── */}
            <div className="relative">
              {/* Rail track (background line) */}
              <div
                aria-hidden="true"
                className="absolute left-5 top-10 bottom-10 w-px bg-border"
              >
                {/* Rail fill — fully filled by default (fallback); GSAP owns the
                    transform during the pin (scaleY driven by scroll progress). */}
                <div
                  ref={railFillRef}
                  className="absolute inset-0 origin-top scale-y-100 bg-brand-gradient"
                />
              </div>

              {processSteps.map((step, i) => (
                <div
                  key={step.id}
                  className={cn(
                    "relative pl-14 py-8 transition-all duration-500",
                    isActive(i) ? "opacity-100" : "opacity-35",
                  )}
                >
                  {/* Dot on the rail */}
                  <div
                    aria-hidden="true"
                    className={cn(
                      "absolute left-[0.875rem] top-10 h-[0.875rem] w-[0.875rem] rounded-full border-2 transition-all duration-500",
                      isActive(i)
                        ? "border-brand-blue bg-brand-gradient scale-125 shadow-[0_0_12px_2px_rgba(37,99,235,0.4)]"
                        : "border-border bg-surface-2",
                    )}
                  />

                  {/* Step content */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "font-mono text-xs font-semibold tracking-widest transition-colors duration-500",
                          isActive(i) ? "text-brand-blue" : "text-muted/50",
                        )}
                      >
                        {step.index}
                      </span>
                      <h3
                        className={cn(
                          "font-sans text-xl font-bold leading-snug transition-colors duration-500",
                          isActive(i) ? "text-foreground" : "text-muted",
                        )}
                      >
                        {step.title}
                      </h3>
                    </div>
                    <p
                      className={cn(
                        "text-sm leading-relaxed transition-colors duration-500",
                        isActive(i) ? "text-muted" : "text-muted/40",
                      )}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── RIGHT: editor visual ─────────────────────────────────────── */}
            <div>
              <div className="flex flex-col gap-6">
                {/* Step counter + big accent number */}
                <div className="flex items-center gap-5">
                  <span
                    aria-hidden="true"
                    className="select-none font-sans text-[6rem] font-black leading-none text-gradient opacity-[0.12] transition-all duration-500"
                  >
                    {current.index}
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue">
                      {current.index}&nbsp;/&nbsp;{String(processSteps.length).padStart(2, "0")}
                    </span>
                    <span className="font-sans text-lg font-bold text-foreground transition-all duration-500">
                      {current.title}
                    </span>
                  </div>
                </div>

                {/* CodeWindow with subtle brand glow behind it. Keyed on the
                    active step so its content cross-fades as the step changes. */}
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-brand-gradient opacity-[0.08] blur-2xl"
                  />
                  <div
                    key={displayedIndex}
                    className="motion-safe:animate-fade-in"
                  >
                    <CodeWindow
                      filename="process.ts"
                      lines={[
                        `// ${current.index} — ${current.title}`,
                        current.code,
                      ]}
                    />
                  </div>
                </div>

                {/* Step dots navigation indicator */}
                <div className="flex items-center gap-2" aria-hidden="true">
                  {processSteps.map((step, i) => (
                    <span
                      key={step.id}
                      className={cn(
                        "block rounded-full transition-all duration-500",
                        isActive(i)
                          ? "h-2 w-6 bg-brand-gradient"
                          : "h-2 w-2 bg-border",
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
