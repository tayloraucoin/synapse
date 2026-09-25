"use client";

import { Step8Landscape } from "@/app/(setup)/_components/step-8-landscape";

/**
 * B9 — the morning routine, the whole landscape (UX v1.3 §4.4 B9, R66;
 * DAY-10) — a PROFILE screen, on the first plan only.
 *
 * Screen 8's component mounted `bare` inside the builder's frame: *Recommended
 * · All*, *All* under *Body · Mind · Practice · Home* and *Your own*, a tick
 * creating the habit at once. Nothing preselected; no arithmetic.
 */
export function ScreenLandscape({ onCount }: { onCount: (count: number) => void }) {
  return <Step8Landscape bare onCountChange={onCount} />;
}
