"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media-query subscription — `@syn/ui` internal. `matchMedia` is
 * web-only, so this does NOT belong in the platform-pure `@syn/hooks`.
 *
 * Returns false on the server and the first client render, then settles to the
 * real match — callers must tolerate a false→true flip. That is fine for
 * presentation switching and wrong for anything that changes what is rendered
 * on the server.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const list = window.matchMedia(query);
    setMatches(list.matches);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/**
 * The one break — cross-cutting §2.1, v2 handoff D7. Compact under 768px, wide
 * at 768px and above. Tablets in portrait get compact, tablets in landscape get
 * wide. There is no second breakpoint and there will not be one.
 *
 * Matches the `wide:` Tailwind variant (`--breakpoint-wide: 768px`), so a
 * component that switches structure in JS and a stylesheet that switches
 * presentation in CSS agree.
 */
export function useIsWide(): boolean {
  return useMediaQuery("(min-width: 768px)");
}
