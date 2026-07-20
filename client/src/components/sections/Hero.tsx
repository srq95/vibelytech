"use client";

import { useRef } from "react";
import VLogoCanvas from "@/components/three/VLogoCanvas";
import { Container } from "@/components/ui/Container";
import { GradientText } from "@/components/ui/GradientText";
import { Button } from "@/components/ui/Button";
import { CodeWindow } from "@/components/ui/CodeWindow";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useLoader } from "@/providers/LoaderProvider";

// Headline split into words so each can stagger independently while the whole
// thing remains a single semantic <h1>. `gradient` words get the brand sweep.
type Word = { text: string; gradient?: boolean };

const HEADLINE: Word[] = [
  { text: "We" },
  { text: "build" },
  { text: "digital", gradient: true },
  { text: "experiences", gradient: true },
  { text: "that" },
  { text: "drive" },
  { text: "real" },
  { text: "growth." },
];

const CODE_LINES = [
  "<Title>Vibely Tech</Title>",
  '<Build digital="experiences" />',
  "// driving real growth →",
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { isReady } = useLoader();

  // --- Intro timeline: fires once the preloader has fully exited (isReady). ---
  useGSAP(
    () => {
      const wordInners = gsap.utils.toArray<HTMLElement>(".hero-word-inner");
      const reveals = gsap.utils.toArray<HTMLElement>("[data-hero-reveal]");
      const glow = ".hero-visual";

      // Reduced motion (or SSR-default fallback): show everything immediately.
      if (reducedMotion) {
        gsap.set([...wordInners, ...reveals, glow], {
          clearProps: "all",
        });
        gsap.set([...wordInners, ...reveals], { opacity: 1, yPercent: 0, y: 0 });
        gsap.set(glow, { opacity: 1, scale: 1 });
        return;
      }

      // Pre-animation state — keep content hidden so nothing flashes before
      // the preloader hands off.
      gsap.set(wordInners, { yPercent: 120, opacity: 0 });
      gsap.set(reveals, { y: 40, opacity: 0 });
      gsap.set(glow, { opacity: 0, scale: 0.82 });

      // Hold the hidden state until the loader signals it's done.
      if (!isReady) return;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      tl.to(glow, { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }, 0)
        .to(
          '[data-hero-reveal="eyebrow"]',
          { y: 0, opacity: 1, duration: 0.6 },
          0.1,
        )
        .to(
          wordInners,
          { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.08 },
          0.25,
        )
        .to(
          '[data-hero-reveal="sub"]',
          { y: 0, opacity: 1, duration: 0.7 },
          "-=0.5",
        )
        .to(
          '[data-hero-reveal="ctas"]',
          { y: 0, opacity: 1, duration: 0.7 },
          "-=0.45",
        )
        .to(
          '[data-hero-reveal="code"]',
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.55",
        )
        .to(
          '[data-hero-reveal="cue"]',
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.4",
        );

      return () => {
        tl.kill();
      };
    },
    { scope: sectionRef, dependencies: [isReady, reducedMotion] },
  );

  // --- Gentle scroll parallax on the V / glow column (gated on motion pref). ---
  useGSAP(
    () => {
      if (reducedMotion) return;

      const tween = gsap.to(".hero-visual", {
        yPercent: 14,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative isolate flex min-h-screen items-center overflow-hidden pt-32 pb-20 md:pt-36"
    >
      {/* ---- Decorative background: drifting aurora blobs + grid + grain ---- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-1/4 left-1/2 h-[70vw] w-[70vw] max-h-[820px] max-w-[820px] -translate-x-1/2 rounded-full bg-brand-gradient opacity-25 blur-[120px] animate-aurora dark:opacity-30" />
        <div className="absolute top-1/3 -right-[10%] h-[46vw] w-[46vw] max-h-[560px] max-w-[560px] rounded-full bg-[radial-gradient(circle_at_center,var(--brand-violet),transparent_70%)] opacity-30 blur-[100px] animate-aurora [animation-delay:-6s] dark:opacity-40" />
        <div className="absolute bottom-0 -left-[10%] h-[40vw] w-[40vw] max-h-[480px] max-w-[480px] rounded-full bg-[radial-gradient(circle_at_center,var(--brand-blue),transparent_70%)] opacity-25 blur-[100px] animate-aurora [animation-delay:-11s] dark:opacity-35" />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.6] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="grain" />
      </div>

      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* ----------------------------- Text column ----------------------------- */}
          <div className="relative z-10 text-center lg:text-left">
            {/* Eyebrow pill */}
            <div
              data-hero-reveal="eyebrow"
              className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm font-medium text-foreground/80"
            >
              <span
                aria-hidden="true"
                className="text-brand-violet-bright"
              >
                ✦
              </span>
              Design &amp; Development Agency
            </div>

            {/* Headline — single h1, word-split for stagger */}
            <h1 className="font-sans text-balance text-[2.25rem] font-bold leading-[1.06] tracking-tight sm:text-[2.75rem] lg:text-[3.25rem] xl:text-[4rem]">
              {HEADLINE.map((word, i) => (
                <span
                  key={i}
                  className="hero-word-mask -mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom"
                >
                  <span className="hero-word-inner inline-block will-change-transform">
                    {word.gradient ? (
                      <GradientText>{word.text}</GradientText>
                    ) : (
                      word.text
                    )}
                  </span>
                  {i < HEADLINE.length - 1 ? " " : null}
                </span>
              ))}
            </h1>

            {/* Sub-copy */}
            <p
              data-hero-reveal="sub"
              className="mx-auto mt-7 max-w-xl text-pretty text-base text-muted sm:text-lg lg:mx-0"
            >
              We&apos;re a design &amp; development studio crafting fast, beautiful
              products — web, mobile, brand, and growth — engineered to turn
              ambitious ideas into measurable results.
            </p>

            {/* CTAs */}
            <div
              data-hero-reveal="ctas"
              className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
            >
              <Button variant="primary" size="lg" href="#contact">
                Start a project
              </Button>
              <Button variant="glass" size="lg" href="#work">
                View our work
              </Button>
            </div>

            {/* Code window motif */}
            <div
              data-hero-reveal="code"
              className="mx-auto mt-12 max-w-md lg:mx-0"
            >
              <CodeWindow filename="vibely.tsx" lines={CODE_LINES} typing />
            </div>
          </div>

          {/* ----------------------------- Visual column ----------------------------- */}
          <div className="relative order-first lg:order-last">
            <div className="hero-visual relative mx-auto aspect-square w-full max-w-[42rem] will-change-transform">
              {/* Soft radial brand glow behind the V */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_center,var(--glow),transparent_68%)] blur-2xl"
              />
              <VLogoCanvas variant="hero" className="relative z-10" />
            </div>
          </div>
        </div>
      </Container>

      {/* ----------------------------- Scroll cue ----------------------------- */}
      <div
        data-hero-reveal="cue"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-7 z-10 flex flex-col items-center gap-2 text-muted"
      >
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.3em]">
          Scroll
        </span>
        <span className="relative flex h-9 w-px overflow-hidden bg-border">
          <span className="absolute inset-x-0 top-0 h-3 w-px bg-brand-gradient animate-[scrollcue_1.8s_ease-in-out_infinite]" />
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4 animate-float"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* Local keyframes for the scroll-cue tracer (unique name, won't clash) */}
      <style>{
        "@keyframes scrollcue { 0% { transform: translateY(-100%); } 100% { transform: translateY(900%); } }"
      }</style>
    </section>
  );
}
