import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: string[];
  reverse?: boolean;
  className?: string;
}

export function Marquee({ items, reverse, className }: MarqueeProps) {
  const animationClass = reverse ? "animate-marquee-rev" : "animate-marquee";

  // Duplicate items for seamless infinite loop
  const allItems = [...items, ...items];

  return (
    <div className={cn("overflow-hidden", className)}>
      <div
        className={cn(
          "flex whitespace-nowrap",
          animationClass,
          "hover:[animation-play-state:paused]",
        )}
      >
        {allItems.map((item, index) => (
          <span key={index} className="flex shrink-0 items-center gap-4 pr-4">
            <span className="text-sm font-medium text-muted">{item}</span>
            <span
              aria-hidden="true"
              className="inline-block h-1 w-1 rounded-full bg-brand-gradient opacity-70"
            />
          </span>
        ))}
      </div>
    </div>
  );
}
