import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={cn("flex flex-col gap-4", alignClass, className)}>
      {eyebrow && (
        <div className="flex items-center gap-2">
          {align === "center" && (
            <span
              aria-hidden="true"
              className="block h-px w-6 rounded-full bg-brand-gradient"
            />
          )}
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue">
            {eyebrow}
          </span>
          <span
            aria-hidden="true"
            className="block h-px w-6 rounded-full bg-brand-gradient"
          />
        </div>
      )}

      <h2 className="font-sans text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
        {title}
      </h2>

      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-muted md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
