"use client";

import { useEffect } from "react";
import "./globals.css";

/**
 * Root-level error boundary. Replaces the entire root layout when an error is
 * thrown in the layout itself, so it must render its own <html>/<body>.
 * Imports globals.css so brand semantic tokens are available for the fallback.
 */
export default function GlobalError({
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
    <html lang="en">
      <body className="antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24 text-center text-foreground">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-brand-blue">
            {"// error"}
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Something went wrong
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
            An unexpected error interrupted this experience. You can try again —
            if it keeps happening, please reach out.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-8 py-3.5 text-base font-semibold text-white outline-none transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_24px_6px_rgb(var(--brand-glow)_/_0.40)] focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 active:scale-[0.97]"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
