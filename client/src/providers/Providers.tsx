"use client";

import { ThemeProvider } from "next-themes";
import { LenisProvider } from "./LenisProvider";
import { LoaderProvider } from "./LoaderProvider";

/**
 * App-wide client provider stack, mounted once in the root layout:
 * theme (next-themes) → smooth scroll (Lenis) → preloader state (Loader).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <LenisProvider>
        <LoaderProvider>{children}</LoaderProvider>
      </LenisProvider>
    </ThemeProvider>
  );
}
