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
 * Process section — scroll-driven "how we work" walkthrough.
 *
 * Layout:
 *   LEFT  — vertical list of processSteps with a brand-gradient rail that fills
 *            as the user scrolls. The active step brightens; inactive steps are muted.
 *   RIGHT — sticky editor visual: a CodeWindow cycling through each step's .code
 *            line, flanked by a large faded gradient index number.
 *
 * Active-step tracking: one ScrollTrigger per step fires onEnter / onEnterBack
 * (callbacks into setState, not direct setState in effect body).
 * Rail fill: a single scrubbed fromTo on a positioned div.
 *
 * Reduced motion: all steps shown active, rail fully filled, no scrub / no triggers.
 */
export default function Process() {
  const [activeStep, setActiveStep] = useState(0);
  const reducedMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const railFillRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion) return;

      // ── Per-step triggers: highlight active step ───────────────────────────
      processSteps.forEach((_, i) => {
        const el = stepRefs.current[i];
        if (!el) return;

        ScrollTrigger.create({
          trigger: el,
          start: "top 62%",
          end: "bottom 38%",
          // setActiveStep called inside callbacks — not in the effect body
          onEnter: () => setActiveStep(i),
          onEnterBack: () => setActiveStep(i),
        });
      });

      // ── Rail fill: scaleY 0 → 1 scrubbed over the whole section ───────────
      const fill = railFillRef.current;
      const section = sectionRef.current;
      if (!fill || !section) return;

      gsap.fromTo(
        fill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "bottom 70%",
            scrub: 0.6,
          },
        },
      );
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  /**
   * In reduced-motion mode every step is "active" — visually all bright.
   * In normal mode only the scroll-tracked step is active.
   */
  function isActive(i: number): boolean {
    return reducedMotion || activeStep === i;
  }

  // Under reduced motion the left list shows every step active (no scroll
  // tracking), so the editor pins to the LAST step instead of being stuck on
  // step 01 — keeping the two columns coherent.
  const displayedIndex = reducedMotion ? processSteps.length - 1 : activeStep;
  const current = processSteps[displayedIndex];

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative overflow-hidden py-24 md:py-32"
    >
      {/* Decorative brand glow — right side */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute right-0 top-1/2 h-[55vw] w-[55vw] max-h-[600px] max-w-[600px] -translate-y-1/2 translate-x-1/3 rounded-full bg-brand-gradient opacity-[0.06] blur-[110px] dark:opacity-[0.13]" />
      </div>

      <Container>
        {/* ── Heading ────────────────────────────────────────────────────────── */}
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

        {/* ── Two-column layout ───────────────────────────────────────────────── */}
        <div className="mt-20 grid grid-cols-1 items-start gap-y-12 lg:grid-cols-2 lg:gap-x-16">

          {/* ── LEFT: step list + animated rail ─────────────────────────────── */}
          <div className="relative">
            {/* Rail track (background line) */}
            <div
              aria-hidden="true"
              className="absolute left-5 top-10 bottom-10 w-px bg-border"
            >
              {/* Rail fill — scaleY animated by GSAP scrub */}
              <div
                ref={railFillRef}
                className="absolute inset-0 origin-top bg-brand-gradient"
                style={
                  !reducedMotion
                    ? { transform: "scaleY(0)", transformOrigin: "top" }
                    : undefined
                }
              />
            </div>

            {processSteps.map((step, i) => (
              <div
                key={step.id}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
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

          {/* ── RIGHT: editor visual (sticky on lg+) ─────────────────────────── */}
          <div>
            <div className="flex flex-col gap-6 lg:sticky lg:top-28">
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

              {/* CodeWindow with subtle brand glow behind it */}
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-brand-gradient opacity-[0.08] blur-2xl"
                />
                <CodeWindow
                  filename="process.ts"
                  lines={[
                    `// ${current.index} — ${current.title}`,
                    current.code,
                  ]}
                />
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
    </section>
  );
}
