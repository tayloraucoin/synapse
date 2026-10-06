"use client";

import { YourDays } from "@/components/day-builder";

/**
 * Screen 4 — *Your days* and the day builder (UX v1.3 §4.4; v1.2 §4.13's
 * screen 13, renumbered by DAY-8).
 *
 * The list and the builder live in `components/day-builder`, because
 * Settings → Your day → Your days mounts the same list embedded (§4.6).
 * *Continue · n days* moves to screen 5, which completes first run (RUN-13);
 * screen 5's *Edit Day A* returns here with `?edit=` so the builder opens on
 * that plan's review. The builder's own screens are v1.2's nine until
 * DAY-9…DAY-11 fill it.
 */
export function Step4Days({ editPlanId = null }: { editPlanId?: string | null }) {
  return <YourDays editPlanId={editPlanId} />;
}
