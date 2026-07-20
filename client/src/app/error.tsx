"use client";

import { useEffect } from "react";

/**
 * Route-segment error boundary. Catches unexpected runtime errors thrown while
 * rendering the page (e.g. a client-side throw) and shows an on-brand fallback
 * with a retry button that re-renders the segment.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-brand-blue">
        {"// error"}
      </p>
      <h1 className="mt-4 font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
        An unexpected error interrupted this experience. You can try again — if
        it keeps happening, please reach out.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-8 py-3.5 text-base font-semibold text-white outline-none transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_24px_6px_rgb(var(--brand-glow)_/_0.40)] focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 active:scale-[0.97]"
      >
        Try again
      </button>
    </main>
  );
}
