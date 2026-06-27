"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "./LenisProvider";

/** Minimum time the preloader stays on screen, even if assets are ready sooner. */
const MIN_DISPLAY_MS = 1600;

export type LoaderPhase = "loading" | "exiting" | "done";

export type LoaderContextValue = {
  /** Current phase of the loading lifecycle. */
  phase: LoaderPhase;
  /** Reported load progress, clamped to 0..100. */
  progress: number;
  /** True until the loader is fully done (`phase !== "done"`). */
  isLoading: boolean;
  /** True once the loader has fully exited (`phase === "done"`). */
  isReady: boolean;
  /** Set load progress (clamped to 0..100). */
  reportProgress: (n: number) => void;
  /** Signal that assets/scene are ready. */
  markReady: () => void;
  /** Called by the Preloader when its exit animation finishes. */
  completeExit: () => void;
};

const LoaderContext = createContext<LoaderContextValue | null>(null);

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  // MUST start as "loading" on both server and client (no window/localStorage
  // reads during render) to avoid hydration mismatches.
  const [phase, setPhase] = useState<LoaderPhase>("loading");
  const [progress, setProgress] = useState(0);

  const lenis = useLenis();

  // Both conditions must hold before we can exit: the asset/scene "ready"
  // signal, and the minimum display time having elapsed.
  const readyRef = useRef(false);
  const minElapsedRef = useRef(false);

  const maybeExit = useCallback(() => {
    if (readyRef.current && minElapsedRef.current) {
      setPhase((prev) => (prev === "loading" ? "exiting" : prev));
    }
  }, []);

  const reportProgress = useCallback((n: number) => {
    setProgress(Math.min(100, Math.max(0, n)));
  }, []);

  const markReady = useCallback(() => {
    readyRef.current = true;
    maybeExit();
  }, [maybeExit]);

  const completeExit = useCallback(() => {
    setPhase((prev) => (prev === "exiting" ? "done" : prev));
  }, []);

  // Minimum-display timer — runs once on mount.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      minElapsedRef.current = true;
      maybeExit();
    }, MIN_DISPLAY_MS);

    return () => window.clearTimeout(timer);
  }, [maybeExit]);

  // Drive the document attribute + scroll lock from the phase. Lenis may be
  // null on first render (provider mounts before the ref settles), so guard it.
  useEffect(() => {
    const root = document.documentElement;

    if (phase === "done") {
      root.removeAttribute("data-loading");
      lenis?.start();
      ScrollTrigger.refresh();
    } else {
      root.setAttribute("data-loading", "true");
      lenis?.stop();
    }
  }, [phase, lenis]);

  const value = useMemo<LoaderContextValue>(
    () => ({
      phase,
      progress,
      isLoading: phase !== "done",
      isReady: phase === "done",
      reportProgress,
      markReady,
      completeExit,
    }),
    [phase, progress, reportProgress, markReady, completeExit],
  );

  return (
    <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>
  );
}

export function useLoader(): LoaderContextValue {
  const ctx = useContext(LoaderContext);
  if (!ctx) {
    throw new Error("useLoader must be used within a <LoaderProvider>.");
  }
  return ctx;
}
