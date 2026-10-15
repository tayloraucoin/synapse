"use client";

import { NowScreen } from "@/app/(shell)/today/_components/now/now-screen";
import { PinnedScenarioProvider } from "@/lib/data/source";

/** Running on Now (USE-23), one scenario each, for the capture host. */
export type RunningPartState =
  | "counting-down"
  | "over-under-a-minute"
  | "over-a-minute-or-more"
  | "paused"
  | "timed-done"
  | "timed-over-warning"
  | "several-running" // USE-24
  | "running-row-focused"
  | "done-on-a-running-row"
  | "done-well-over";

export function RunningPart({ state }: { state: RunningPartState }) {
  return (
    <PinnedScenarioProvider value={state}>
      <NowScreen />
    </PinnedScenarioProvider>
  );
}
