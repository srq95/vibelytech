"use client";

import { site } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";

/**
 * CTA — the page finale.
 *
 * A full-bleed brand-gradient panel inside a Container with generous vertical
 * rhythm. Layered depth: grain overlay + faint pixel/grid texture + an
 * oversized "V" watermark (all aria-hidden / decorative). The primary action
 * uses a `glass` Button so it reads as a frosted chip against the gradient,
 * paired with real mailto / tel links for the contact details.
 */
export default function CTA() {
  return (
    <section id="contact" className="relative py-24 md:py-32">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-brand-gradient px-6 py-20 text-center sm:px-12 md:px-16 md:py-28">
          {/* ── Decorative depth layers (all decorative) ───────────────────── */}
          {/* Faint pixel/grid texture */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />

          {/* Soft top highlight + bottom shadow for a lit-panel feel */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.25),transparent_55%)]"
          />

          {/* Oversized watermark "V" */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -bottom-24 select-none text-[22rem] font-black leading-none text-white/[0.07] sm:-right-4 md:text-[30rem]"
          >
            V
          </div>

          {/* Film grain */}
          <div aria-hidden="true" className="grain mix-blend-overlay !opacity-[0.08]" />

          {/* ── Content ─────────────────────────────────────────────────────── */}
          <div className="relative mx-auto flex max-w-3xl flex-col items-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/90 ring-1 ring-inset ring-white/25 backdrop-blur-sm">
              Let&apos;s talk
            </span>

            <h2 className="text-balance text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
              Let&apos;s build something <br className="hidden sm:block" />
              that drives real growth.
            </h2>

            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/85 md:text-lg">
              Have a product to launch, a brand to elevate, or an ambitious idea
              that needs both design and engineering? Tell us about it — we
              reply within one business day.
            </p>

            {/* Primary action */}
            <div className="mt-10">
              <Magnetic>
                <Button
                  variant="glass"
                  size="lg"
                  href={`mailto:${site.email}`}
                  className="!bg-white/95 !text-brand-blue-deep shadow-[0_8px_30px_-6px_rgba(0,0,0,0.35)] hover:!bg-white"
                >
                  Start a project
                </Button>
              </Magnetic>
            </div>

            {/* Contact links */}
            <div className="mt-8 flex flex-col items-center gap-2 text-sm text-white/90 sm:flex-row sm:gap-8">
              <a
                href={`mailto:${site.email}`}
                className="font-medium underline-offset-4 transition-opacity hover:underline hover:opacity-100 focus-visible:underline"
              >
                {site.email}
              </a>
              <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-white/40 sm:block" />
              <a
                href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}
                className="font-medium underline-offset-4 transition-opacity hover:underline hover:opacity-100 focus-visible:underline"
              >
                {site.phone}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
