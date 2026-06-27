import { services } from "@/content/services";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GradientText } from "@/components/ui/GradientText";
import { GlassCard } from "@/components/ui/GlassCard";
import { CodeWindow } from "@/components/ui/CodeWindow";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Services section — four GlassCards in a responsive 2-col grid.
 * Server component: no hooks needed here. Reveal / GlassCard / CodeWindow
 * each carry their own "use client" boundary.
 */
export default function Services() {
  return (
    <section
      id="services"
      className="relative overflow-hidden py-24 md:py-32"
    >
      {/* Decorative radial brand glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/2 top-0 h-[55vw] w-[55vw] max-h-[600px] max-w-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-brand-gradient opacity-[0.07] blur-[110px] dark:opacity-[0.13]" />
      </div>

      <Container>
        {/* Section heading */}
        <Reveal>
          <SectionHeading
            eyebrow="// services"
            title={
              <>
                Design <GradientText>meets</GradientText> development
              </>
            }
            description="We craft end-to-end digital products — from pixel-perfect interfaces to production-grade engineering — for brands ready to grow."
          />
        </Reveal>

        {/* Service cards grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {services.map((service, i) => (
            <Reveal
              key={service.id}
              delay={i * 0.08}
              className="h-full"
            >
              <GlassCard
                interactive
                className="relative flex h-full flex-col p-8"
              >
                {/* Large faded index watermark */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-6 top-4 select-none font-sans text-8xl font-black leading-none text-foreground/[0.04]"
                >
                  {service.index}
                </span>

                {/* Header */}
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-sans text-xl font-bold leading-snug text-foreground">
                    {service.title}
                  </h3>
                  <p className="text-sm font-semibold text-brand-blue">
                    {service.tagline}
                  </p>
                </div>

                {/* Description — flex-1 pushes footer to bottom */}
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                  {service.description}
                </p>

                {/* Code snippet — compact editor motif */}
                <div className="mt-5">
                  <CodeWindow lines={[service.snippet]} />
                </div>

                {/* Footer: capability pills + hover CTA */}
                <div className="mt-6 flex flex-col gap-4">
                  {/* Capability pills */}
                  <div className="flex flex-wrap gap-2">
                    {service.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-muted transition-colors duration-200 group-hover:border-brand-blue/30 group-hover:text-foreground/80"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>

                  {/* "Learn more" arrow — appears on hover */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-blue opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <span>Learn more</span>
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
