"use client";

import { type ElementType, type ReactNode, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  as?: ElementType;
}

export function Reveal({
  children,
  className,
  y = 24,
  delay = 0,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (reducedMotion) {
        gsap.set(el, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(el, { opacity: 0, y });

      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay,
            ease: "power3.out",
          });
        },
      });

      return () => trigger.kill();
    },
    { scope: ref, dependencies: [reducedMotion, y, delay] },
  );

  // Cast to satisfy TypeScript — Tag is a valid HTML element type
  const Component = Tag as "div";

  return (
    <Component ref={ref as React.RefObject<HTMLDivElement>} className={cn(className)}>
      {children}
    </Component>
  );
}
