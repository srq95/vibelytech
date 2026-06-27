"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

/** SSR-safe "mounted" check: server → false, client → true. */
function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  function toggle() {
    // Set an explicit value based on the *resolved* theme (correct even when
    // the stored preference is "system").
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  const buttonClass = cn(
    "glass inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
    "hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue",
    className,
  );

  // Render a neutral placeholder until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className={buttonClass}
        disabled
      >
        <span className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className={buttonClass}
    >
      <span className="relative flex h-[18px] w-[18px] items-center justify-center">
        <SunIcon
          className={cn(
            "absolute transition-all duration-300",
            isDark ? "scale-0 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0",
          )}
        />
        <MoonIcon
          className={cn(
            "absolute transition-all duration-300",
            isDark ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90",
          )}
        />
      </span>
    </button>
  );
}
