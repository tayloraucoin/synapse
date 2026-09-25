"use client";

import { Step9Ranked } from "@/app/(setup)/_components/step-9-ranked";

/**
 * B10 — the morning routine, ranked (UX v1.3 §4.4 B10, R57–R59, R62;
 * DAY-10) — a PROFILE screen, on the first plan only.
 *
 * Screen 9's component mounted `bare` inside the builder's frame: one card
 * per ticked habit in the order ticked, *Usually takes* by one, and *Done*
 * collapsing the card in place to its two lines with the matters cell
 * (DAY-2's behaviour, unchanged).
 */
export function ScreenRanked() {
  return <Step9Ranked bare />;
}
