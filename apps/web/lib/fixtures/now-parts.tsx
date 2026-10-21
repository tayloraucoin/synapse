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
  | "sunday-checklist"
  | "sunday-checklist-tick-pending"
  | "sunday-checklist-not-saved"
  // USE-21: a To-dos block and the system states.
  | "todos-block"
  | "offline"
  | "error-on-check"
  | "now-loading"
  | "now-partial-todos"
  | "now-partial-block"
  // USE-20: a block's end and the day's.
  | "all-done-start-next"
  | "all-done-add-more"
  | "ahead"
  | "empty-break"
  | "empty-no-blocks"
  // USE-25: Block complete with items left, the last block, all done.
  | "not-done-closed"
  | "not-done-open"
  | "not-done-do-now"
  | "last-block"
  | "all-done"
  // USE-110: wave 2's loose ends on Now.
  | "ready-go-not-yet-started"
  | "firing-still-firing"
  | "wind-down-journal"
  | "wind-down-journal-empty"
  // USE-114: a new build's worker waits; the shell's update line shows.
  | "update-ready";

export function NowPart({ state }: { state: NowPartState }) {
  return (
    <PinnedScenarioProvider value={state}>
      <NowScreen />
    </PinnedScenarioProvider>
  );
}
