"use client";

import { Component, type ReactNode } from "react";

interface CanvasErrorBoundaryProps {
  /** Rendered instead of `children` if a render error is caught (e.g. WebGL). */
  fallback: ReactNode;
  children: ReactNode;
}

interface CanvasErrorBoundaryState {
  hasError: boolean;
}

/**
 * Minimal client-side error boundary for the R3F <Canvas>. React has no hook
 * equivalent, so this is a tiny class component. If three/WebGL throws during
 * render the brand-gradient CSS/SVG fallback is shown instead of the error
 * propagating up to the route-level boundary (which would otherwise leave the
 * user stuck under the locked navy preloader overlay).
 *
 * NOTE: the preloader drives its own progress + markReady independently of the
 * 3D scene, so the loader still exits normally even when WebGL fails here.
 */
export class CanvasErrorBoundary extends Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  state: CanvasErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("VLogoCanvas render failed; showing fallback.", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
