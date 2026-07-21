"use client";

import { type ReactNode, useRef, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

export function GlassCard({ children, className, interactive }: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--mx", `${x}%`);
    cardRef.current.style.setProperty("--my", `${y}%`);
  }

  function handleMouseLeave() {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty("--mx", "50%");
    cardRef.current.style.setProperty("--my", "50%");
  }

  if (interactive) {
    return (
      <div
        ref={cardRef}
        className={cn(
          "glass rounded-3xl p-6 relative overflow-hidden transition-transform duration-300",
          "hover:-translate-y-1 hover:shadow-[0_20px_60px_-10px_rgb(var(--brand-glow)_/_0.25)]",
          "group",
          className,
        )}
        style={
          {
            "--mx": "50%",
            "--my": "50%",
          } as React.CSSProperties
        }
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* pointer-following radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle 220px at var(--mx) var(--my), rgb(var(--brand-glow) / 0.12), transparent 70%)",
          }}
        />
        {children}
      </div>
    );
  }

  return (
    <div className={cn("glass rounded-3xl p-6", className)}>
      {children}
    </div>
  );
}
