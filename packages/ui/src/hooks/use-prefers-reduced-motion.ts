/**
 * usePrefersReducedMotion — reactive `prefers-reduced-motion: reduce` read.
 *
 * SSR-safe: returns `false` until mounted, then subscribes to changes so a
 * mid-session OS toggle is honoured without a reload.
 */
"use client";

import * as React from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(QUERY);
    setReduced(mql.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
