import { Marquee } from "@/components/ui/Marquee";
import { marqueeItems } from "@/content/stats";

/**
 * Full-width scroll-reactive marquee band between Hero and Services.
 *
 * Two counter-scrolling rows for depth: a big display row (alternating filled
 * gradient + ghost-outlined words) over a compact reversed caps row. Both react
 * to scroll velocity and fade into the page at each edge via a mask. Hairline
 * brand-tinted borders top and bottom keep it sitting intentionally in the flow.
 * The reversed row is purely decorative and `aria-hidden`.
 */
export default function MarqueeStrip() {
  return (
    <section
      className="relative isolate overflow-hidden border-y border-border bg-surface/40 py-10 md:py-14"
      aria-label="What we do"
    >
      {/* Subtle brand-gradient wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-brand-gradient opacity-[0.04] dark:opacity-[0.07]"
      />
      {/* Hairline gradient borders */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-blue/35 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-violet/35 to-transparent"
      />

      <div className="flex flex-col gap-3 md:gap-5">
        {/* Big display row — readable services list */}
        <Marquee items={marqueeItems} variant="display" speed={48} />

        {/* Compact reversed caps row — decorative depth layer */}
        <div aria-hidden="true">
          <Marquee items={marqueeItems} variant="label" reverse speed={32} />
        </div>
      </div>
    </section>
  );
}
