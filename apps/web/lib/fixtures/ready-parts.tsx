"use client";

import { WelcomeFrame } from "@/app/(shell)/today/ready/_components";
import { PinnedScenarioProvider } from "@/lib/data/source";

/** The Ready, go welcome's frames (USE-43), one scenario each, for the capture host. */
export type ReadyPartState =
  | "welcome"
  | "first-go-ever"
  | "late-wake"
  | "checklist-day"
  | "offline";

export function ReadyPart({ state }: { state: ReadyPartState }) {
  return (
    <PinnedScenarioProvider value={`ready-${state}`}>
      <WelcomeFrame />
    </PinnedScenarioProvider>
  );
}
