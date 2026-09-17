"use client";

import { YourDays } from "@/components/day-builder";

/**
 * Screen 13 — *Your days* and the day builder (UX v1.2 §4.13; RUN-12).
 *
 * The list and the nine-screen builder live in `components/day-builder`,
 * because Settings → Your day → Your days mounts the same list embedded
 * (§4.16). In the sequence, *Continue · n days* completes first run — as
 * RUN-8's placeholder did — until RUN-13 moves completion to screen 14.
 */
export function Step13Days() {
  return <YourDays />;
}
