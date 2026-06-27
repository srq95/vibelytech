import { type ReactNode, createElement } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: string;
}

export function Container({
  children,
  className,
  as: tag = "div",
}: ContainerProps) {
  return createElement(
    tag,
    { className: cn("mx-auto w-full max-w-7xl px-6 md:px-10", className) },
    children,
  );
}
