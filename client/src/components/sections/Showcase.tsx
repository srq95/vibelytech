"use client";

import { useRef } from "react";
import Link from "next/link";
import { projects, type Project } from "@/content/showcase";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GradientText } from "@/components/ui/GradientText";
import { Button } from "@/components/ui/Button";

/**
 * Showcase — pinned horizontal-scroll case-study gallery.
 *
 * Desktop + motion-allowed: the pin wrapper pins to the viewport and the
 * horizontal track of panels translates sideways as the user scrolls down
 * (classic GSAP ScrollTrigger pin + scrubbed x tween). A brand-gradient
 * progress bar tracks how far through the pinned section you are.
 *
 * Mobile (< 768px) OR prefers-reduced-motion: reduce → no pin / no translate.
 * The SAME DOM degrades into a horizontal scroll-snap carousel (native,
 * fully usable, keyboard + touch accessible). CSS `motion-safe:md:*` variants
 * flip the layout, so the fallback is the default and the pin branch only
 * activates inside the matching `gsap.matchMedia()` query.
 */
export default function Showcase() {
  const ref = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      const pin = pinRef.current;
      const bar = barRef.current;
      if (!track || !pin) return;

      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const getDistance = () =>
            Math.max(0, track.scrollWidth - window.innerWidth);

          const tween = gsap.to(track, {
            x: () => -getDistance(),
            ease: "none",
            scrollTrigger: {
              trigger: pin,
              start: "top top",
              end: () => "+=" + getDistance(),
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              anticipatePin: 1,
              onUpdate: (self) => {
                if (bar) gsap.set(bar, { scaleX: self.progress });
              },
            },
          });

          return () => {
            tween.scrollTrigger?.kill();
            tween.kill();
            gsap.set(track, { clearProps: "transform" });
            if (bar) gsap.set(bar, { scaleX: 0 });
          };
        },
      );

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="work" className="relative overflow-hidden">
      {/* Decorative radial brand glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute right-0 top-1/4 h-[55vw] w-[55vw] max-h-[620px] max-w-[620px] translate-x-1/3 rounded-full bg-brand-gradient opacity-[0.07] blur-[120px] dark:opacity-[0.12]" />
      </div>

      {/* Intro */}
      <Container className="pt-24 md:pt-32">
        <SectionHeading
          align="left"
          eyebrow="// selected work"
          title={
            <>
              Work that <GradientText>drives growth</GradientText>
            </>
          }
          description="A selection of products and brands we've shipped — engineered for speed, designed to convert, built to last."
        />
      </Container>

      {/* Pin wrapper — fallback: scroll-snap carousel; pinned on desktop+motion. */}
      <div
        ref={pinRef}
        className={cn(
          "relative mt-12 w-full overflow-x-auto overscroll-x-contain md:mt-16",
          "motion-safe:md:mt-0 motion-safe:md:h-screen motion-safe:md:overflow-hidden",
        )}
      >
        <div
          ref={trackRef}
          className={cn(
            "flex snap-x snap-mandatory items-stretch gap-6 px-6 pb-16 md:gap-8 md:px-10",
            "motion-safe:md:h-screen motion-safe:md:snap-none motion-safe:md:items-center motion-safe:md:pb-0",
          )}
        >
          {projects.map((project, i) => (
            <ProjectPanel
              key={project.id}
              project={project}
              index={i + 1}
              total={projects.length}
            />
          ))}

          {/* Trailing CTA panel */}
          <article
            className={cn(
              "relative flex h-[72vh] w-[85vw] shrink-0 snap-center flex-col items-start justify-center overflow-hidden rounded-3xl border border-border p-8 md:h-[80vh] md:w-[80vw] md:p-12 lg:w-[min(40rem,80vw)]",
              "glass",
            )}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-[0.10]"
            />
            <span className="grain" aria-hidden="true" />
            <p className="relative font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue">
              {"// ready when you are"}
            </p>
            <h3 className="relative mt-4 max-w-md font-sans text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
              Let&apos;s build something that <GradientText>grows</GradientText>.
            </h3>
            <p className="relative mt-4 max-w-sm text-base leading-relaxed text-muted">
              Have a project in mind? We&apos;d love to hear about it.
            </p>
            <div className="relative mt-8">
              <Button href="#contact" size="lg">
                Let&apos;s work together
                <span aria-hidden="true">→</span>
              </Button>
            </div>
          </article>
        </div>

        {/* Horizontal progress bar — pinned mode only */}
        <div
          aria-hidden="true"
          className="absolute bottom-6 left-1/2 hidden h-1 w-[min(90vw,40rem)] -translate-x-1/2 overflow-hidden rounded-full bg-foreground/10 motion-safe:md:block"
        >
          <div
            ref={barRef}
            className="h-full w-full origin-left scale-x-0 rounded-full bg-brand-gradient"
          />
        </div>
      </div>
    </section>
  );
}

interface ProjectPanelProps {
  project: Project;
  index: number;
  total: number;
}

function ProjectPanel({ project, index, total }: ProjectPanelProps) {
  return (
    <article
      className="relative flex h-[72vh] w-[85vw] shrink-0 snap-center flex-col justify-end overflow-hidden rounded-3xl md:h-[80vh] md:w-[80vw] lg:w-[min(48rem,80vw)]"
    >
      {/* Vivid gradient visual */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          project.gradient,
        )}
      />

      {/* Pixel / grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />
      {/* Film grain for richness */}
      <span className="grain" aria-hidden="true" />
      {/* Bottom darkening for legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
      />

      {/* Index counter, top-left */}
      <div className="absolute left-6 top-6 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white/80 md:left-8 md:top-8">
        <span className="text-white">
          {String(index).padStart(2, "0")}
        </span>
        <span className="text-white/50">/ {String(total).padStart(2, "0")}</span>
      </div>

      {/* Glass info layer */}
      <div className="relative m-4 rounded-2xl p-6 glass md:m-6 md:p-8">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs font-medium uppercase tracking-wider text-foreground/70">
          <span className="text-foreground">{project.client}</span>
          <span aria-hidden="true" className="text-foreground/30">
            ·
          </span>
          <span>{project.category}</span>
          <span aria-hidden="true" className="text-foreground/30">
            ·
          </span>
          <span>{project.year}</span>
        </div>

        {/* Title */}
        <h3 className="mt-3 font-sans text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
          {project.title}
        </h3>

        {/* Description */}
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-base">
          {project.description}
        </p>

        {/* Metrics — prominent */}
        <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
          {project.metrics.map((metric) => (
            <div key={metric.label} className="flex flex-col">
              <dt className="order-2 mt-1 font-mono text-[0.7rem] font-medium uppercase tracking-wider text-muted">
                {metric.label}
              </dt>
              <dd className="order-1 font-sans text-3xl font-black leading-none tracking-tight md:text-4xl">
                <span className="text-gradient">{metric.value}</span>
              </dd>
            </div>
          ))}
        </dl>

        {/* Footer: tags + case-study link */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-muted"
              >
                {tag}
              </span>
            ))}
          </div>

          <Link
            href={`/work/${project.id}`}
            className="group inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-brand-blue outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
          >
            View case study
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
