"use client";

import { site } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { GradientText } from "@/components/ui/GradientText";
import { Reveal } from "@/components/ui/Reveal";

// Short "City, ST" derived from the full postal address for an elegant
// location trust-touch (e.g. "Austin, TX").
const addressParts = site.address.split(",").map((part) => part.trim());
const cityState = [addressParts[2], addressParts[3]?.split(" ")[0]]
  .filter(Boolean)
  .join(", ");

// tel: links want a clean, dial-able value (digits + leading +).
const telHref = `tel:${site.phone.replace(/[^+\d]/g, "")}`;

/**
 * CTA — the page finale ("Let's talk").
 *
 * A refined liquid-glass panel floating over a soft brand aurora, framed by a
 * slow-drifting gradient hairline. Elegant `GradientText` headline, a single
 * `Magnetic` primary action, prominent email / phone, and a couple of quiet
 * trust touches. All decorative layers are aria-hidden; works light + dark via
 * semantic tokens. Entrance is a gated `Reveal`.
 */
export default function CTA() {
  return (
    <section id="contact" className="relative isolate overflow-hidden py-24 md:py-32">
      {/* ── Decorative background: soft brand aurora + grid + grain ─────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/2 top-1/2 h-[60vw] w-[60vw] max-h-[680px] max-w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gradient opacity-[0.18] blur-[120px] animate-aurora dark:opacity-25" />
        <div className="absolute -right-[8%] top-1/4 h-[34vw] w-[34vw] max-h-[420px] max-w-[420px] rounded-full bg-[radial-gradient(circle_at_center,var(--brand-violet),transparent_70%)] opacity-25 blur-[100px] animate-aurora [animation-delay:-7s] dark:opacity-35" />
        <div className="absolute -left-[8%] bottom-0 h-[30vw] w-[30vw] max-h-[360px] max-w-[360px] rounded-full bg-[radial-gradient(circle_at_center,var(--brand-blue),transparent_70%)] opacity-20 blur-[100px] animate-aurora [animation-delay:-12s] dark:opacity-30" />
        <div className="absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_72%)] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="grain" />
      </div>

      <Container>
        <Reveal y={32}>
          {/* Animated gradient hairline frame */}
          <div className="relative rounded-[2.6rem] p-px bg-[linear-gradient(115deg,var(--brand-start),var(--brand-end),var(--brand-start))] bg-[length:200%_auto] animate-shimmer [animation-duration:9s] shadow-[0_30px_90px_-30px_var(--glow)]">
            <div className="relative isolate overflow-hidden rounded-[calc(2.6rem-1px)] glass-strong px-6 py-16 text-center sm:px-12 md:px-16 md:py-24">
              {/* Soft top highlight inside the panel */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--glow),transparent_60%)] opacity-40"
              />
              {/* Oversized watermark "V" */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -right-8 select-none text-[20rem] font-black leading-none text-gradient opacity-[0.05] sm:-right-2 md:text-[26rem]"
              >
                V
              </div>

              <div className="relative mx-auto flex max-w-3xl flex-col items-center">
                {/* Eyebrow */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm font-medium text-foreground/80">
                  <span aria-hidden="true" className="text-brand-violet-bright">
                    ✦
                  </span>
                  Let&apos;s talk
                </div>

                {/* Headline */}
                <h2 className="text-balance font-sans text-4xl font-bold leading-[1.07] tracking-tight text-foreground sm:text-5xl md:text-6xl">
                  Let&apos;s build something that drives{" "}
                  <GradientText>real growth.</GradientText>
                </h2>

                {/* Supporting line */}
                <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted md:text-lg">
                  Have a product to launch, a brand to elevate, or an ambitious
                  idea that needs both design and engineering? Tell us about it —
                  we reply within one business day.
                </p>

                {/* Primary action */}
                <div className="mt-10">
                  <Magnetic>
                    <Button variant="primary" size="lg" href={`mailto:${site.email}`}>
                      Start a project
                    </Button>
                  </Magnetic>
                </div>

                {/* Contact links */}
                <div className="mt-10 flex flex-col items-center gap-4 text-foreground sm:flex-row sm:gap-10">
                  <a
                    href={`mailto:${site.email}`}
                    className="group text-lg font-medium tracking-tight transition-colors duration-200 sm:text-xl"
                  >
                    <span className="bg-[linear-gradient(115deg,var(--brand-start),var(--brand-end))] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-300 ease-out group-hover:bg-[length:100%_2px]">
                      {site.email}
                    </span>
                  </a>
                  <span
                    aria-hidden="true"
                    className="hidden h-1 w-1 rounded-full bg-border sm:block"
                  />
                  <a
                    href={telHref}
                    className="group text-lg font-medium tracking-tight transition-colors duration-200 sm:text-xl"
                  >
                    <span className="bg-[linear-gradient(115deg,var(--brand-start),var(--brand-end))] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-300 ease-out group-hover:bg-[length:100%_2px]">
                      {site.phone}
                    </span>
                  </a>
                </div>

                {/* Trust touches */}
                <div className="mt-8 flex flex-col items-center gap-3 text-sm text-muted sm:flex-row sm:gap-6">
                  <span className="inline-flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Available for new projects
                  </span>
                  {cityState && (
                    <>
                      <span
                        aria-hidden="true"
                        className="hidden h-1 w-1 rounded-full bg-border sm:block"
                      />
                      <span className="inline-flex items-center gap-2">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                          className="h-3.5 w-3.5 text-brand-blue"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 21s-7-5.686-7-11a7 7 0 1114 0c0 5.314-7 11-7 11z" />
                          <circle cx="12" cy="10" r="2.5" />
                        </svg>
                        {cityState}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
