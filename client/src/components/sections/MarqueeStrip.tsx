import { Marquee } from "@/components/ui/Marquee";
import { marqueeItems } from "@/content/stats";

/**
 * Full-width decorative marquee band between Hero and Services.
 * Two rows (one forward, one reversed) separated by a hairline border.
 * The second row is aria-hidden since it duplicates content.
 */
export default function MarqueeStrip() {
  return (
    <section
      className="relative overflow-hidden border-t border-b border-border bg-surface/40 py-4"
      aria-label="Services we offer"
    >
      {/* Subtle center highlight line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-brand-blue/15 to-transparent"
      />

      {/* Primary scrolling row */}
      <Marquee items={marqueeItems} />

      {/* Reversed duplicate row — purely decorative depth layer */}
      <div aria-hidden="true" className="mt-2">
        <Marquee items={marqueeItems} reverse />
      </div>
    </section>
  );
}
