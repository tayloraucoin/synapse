"use client";

import { YourDays } from "@/components/day-builder";

/**
 * Screen 13 — *Your days* and the day builder (UX v1.2 §4.13; RUN-12).
 *
 * The list and the nine-screen builder live in `components/day-builder`,
 * because Settings → Your day → Your days mounts the same list embedded
 * (§4.16). *Continue · n days* moves to screen 14, which completes first
 * run (RUN-13); screen 14's *Edit Day A* returns here with `?edit=` so the
 * builder opens on that plan's review.
 */
export function Step13Days({ editPlanId = null }: { editPlanId?: string | null }) {
  return <YourDays editPlanId={editPlanId} />;
}
