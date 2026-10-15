"use client";

import { ScheduleScreen } from "@/app/(shell)/today/schedule/_components/schedule-screen";
import { PinnedScenarioProvider } from "@/lib/data/source";

/** Schedule's states (USE-27), one scenario each, for the capture host. */
export type SchedulePartState =
  | "during-go"
  | "checks-and-running"
  | "checklist-day"
  | "meeting-inside-a-block"
  | "schedule-empty"
  | "schedule-loading"
  | "schedule-error"
  | "schedule-partial"
  | "schedule-offline";

export function SchedulePart({ state }: { state: SchedulePartState }) {
  return (
    <PinnedScenarioProvider value={state}>
      {/* The page's own height, less the tabs the capture host has none of. */}
      <div className="flex h-dvh flex-col">
        <ScheduleScreen />
      </div>
    </PinnedScenarioProvider>
  );
}
