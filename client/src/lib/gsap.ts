"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Single registration point for the whole app. Every component imports gsap
// and plugins from here — never call registerPlugin elsewhere.
// registerPlugin is idempotent, so calling it once on the client is safe.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };
