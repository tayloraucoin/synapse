"use client";

import { NowScreen } from "@/app/(shell)/today/_components/now/now-screen";
import { PinnedScenarioProvider } from "@/lib/data/source";

/** Now's drawn states (USE-16), one scenario each, for the capture host. */
export type NowPartState =
  | "success"
  | "done-next-lifts"
  | "row-tapped"
  | "took-change"
  | "time-taken-sheet"
  | "row-long-press"
  | "reordering"
  | "header-menu"
  | "behind"
  | "transition"
  | "before-ready-go"
  | "checklist-block"
  | "sunday-checklist";

export function NowPart({ state }: { state: NowPartState }) {
  return (
    <PinnedScenarioProvider value={state}>
      <NowScreen />
    </PinnedScenarioProvider>
  );
}
