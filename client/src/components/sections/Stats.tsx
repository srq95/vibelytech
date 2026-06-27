"use client";

import { useRef } from "react";
import { stats } from "@/content/stats";
import { site } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GradientText } from "@/components/ui/GradientText";
import { Reveal } from "@/components/ui/Reveal";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Stats / About section — agency story + animated count-up metrics.
 *
 * Count-up approach:
 *   - Each number <span> gets a ref stored in `numberRefs`.
 *   - In `useGSAP`, a paused GSAP tween tweens a proxy `{ n: 0 }` to the
 *     final value. `onUpdate` writes `Math.round(proxy.n)` directly into the
 *     DOM element — no React state involved, so no re-render overhead.
 *   - The tween is played inside a ScrollTrigger `onEnter` callback (once).
 *   - Reduced motion: the element text is set to the final value immediately
 *     inside the effect (direct DOM write, not setState) — no scroll trigger.
 *
 * Both paths respect React 19's "no setState in effect body" guidance because
 * no `useState` setter is called at all — only DOM mutations via refs.
 */
export default function Stats() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const numberRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useGSAP(
    () => {
      stats.forEach((stat, i) => {
        const el = numberRefs.current[i];
        if (!el) return;

        if (reducedMotion) {
          // Show the final value immediately — DOM write, not setState
          el.textContent = stat.value.toString();
          return;
        }

        // Reset to 0 while waiting for scroll trigger
        el.textContent = "0";

        const proxy = { n: 0 };
        const tween = gsap.to(proxy, {
          n: stat.value,
          duration: 2.2,
          ease: "power2.out",
          paused: true,
          onUpdate() {
            el.textContent = Math.round(proxy.n).toString();
          },
          onComplete() {
            // Ensure exact final value (avoids rounding artefact on last frame)
            el.textContent = stat.value.toString();
          },
        });

        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          once: true,
          // tween.play() called inside callback — not in effect body
          onEnter: () => tween.play(),
        });
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden py-24 md:py-32"
    >
      {/* Decorative brand glow — left side */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-0 top-1/2 h-[55vw] w-[55vw] max-h-[600px] max-w-[600px] -translate-x-1/3 -translate-y-1/2 rounded-full bg-brand-gradient opacity-[0.06] blur-[110px] dark:opacity-[0.12]" />
      </div>

      <Container>
        {/* ── Agency story ────────────────────────────────────────────────────── */}
        <div className="mb-20">
          <Reveal>
            <SectionHeading
              eyebrow="// about"
              title={
                <>
                  Five years <GradientText>building</GradientText> what&apos;s next
                </>
              }
              align="left"
            />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-8 grid max-w-3xl gap-5 text-base leading-relaxed text-muted md:grid-cols-2 md:gap-8 md:text-[1.0625rem]">
              <p>
                Since 2021, {site.name} has partnered with founders, scale-ups,
                and enterprise brands to ship digital products that stand apart.
                From pixel-perfect interfaces to production-grade systems, we
                bring craft and code into one cohesive practice.
              </p>
              <p>
                We believe the best products live at the intersection of design
                and engineering. Our cross-functional team of designers,
                developers, and strategists ships fast and thinks deep —
                turning ambitious visions into growing digital businesses.
              </p>
            </div>
          </Reveal>
        </div>

        {/* ── Stats grid ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {stats.map((stat, i) => (
            <Reveal key={stat.id} delay={i * 0.08}>
              <div className="glass rounded-2xl p-6 flex flex-col items-center gap-2 text-center">
                {/* Animated number row */}
                <div
                  className="flex items-baseline justify-center gap-0.5 font-sans font-black leading-none"
                  aria-label={`${stat.prefix ?? ""}${stat.value}${stat.suffix}`}
                >
                  {stat.prefix && (
                    <span className="text-gradient text-2xl md:text-3xl">
                      {stat.prefix}
                    </span>
                  )}
                  <span
                    className="text-gradient text-4xl md:text-5xl"
                    ref={(el) => {
                      numberRefs.current[i] = el;
                    }}
                    aria-hidden="true"
                  >
                    {stat.value}
                  </span>
                  <span className="text-gradient text-2xl md:text-3xl">
                    {stat.suffix}
                  </span>
                </div>

                {/* Label */}
                <span className="text-xs font-medium uppercase tracking-widest text-muted md:text-sm">
                  {stat.label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
