"use client";

import { JournalScreen } from "@/components/journal";
import { PinnedScenarioProvider } from "@/lib/data/source";
import { BASE_DATE } from "./scenarios/base-day";

/** Close the day's states (USE-44), on Monday's journal, for the capture host. */
export type JournalPartState =
  "journal" | "empty" | "offline" | "read-only" | "nothing-written";

export function JournalPart({ state }: { state: JournalPartState }) {
  return (
    <PinnedScenarioProvider value={`close-${state}`}>
      <JournalScreen dateKey={BASE_DATE} />
    </PinnedScenarioProvider>
  );
}
