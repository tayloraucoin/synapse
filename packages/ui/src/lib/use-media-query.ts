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
 * The sheet break — cross-cutting §2.1, v2 handoff D7. Compact under 768px,
 * wide at 768px and above; `ResponsiveSheet` switches here.
 *
 * Matches the `wide:` Tailwind variant (`--breakpoint-wide: 768px`), so a
 * component that switches structure in JS and a stylesheet that switches
 * presentation in CSS agree.
 *
 * There are two breaks now (D-USE-93): 768 for sheets, and 1024 for the desk
 * (`useIsSplit`). No third.
 */
export function useIsWide(): boolean {
  return useMediaQuery("(min-width: 768px)");
}

/**
 * The desk break — D-USE-93. From 1024px the rail and the desk surfaces show;
 * below it the phone's tabs (768 to 1023 included, D-USE-74).
 *
 * Matches the `split:` Tailwind variant (`--breakpoint-split: 1024px`). The
 * shell's chrome switches on the variant, never on this: like every hook here
 * it reads false on the server, and the server must not guess the width.
 */
export function useIsSplit(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
