"use client";

import { OrientFrame } from "@/app/(shell)/orient/_components";
import { PinnedScenarioProvider } from "@/lib/data/source";

/** Orient's drawn states (USE-12), one scenario each, for the capture host. */
export type OrientPartState =
  "success" | "late" | "empty" | "loading" | "error" | "offline";

export function OrientPart({ state }: { state: OrientPartState }) {
  return (
    <PinnedScenarioProvider value={`orient-${state}`}>
      <OrientFrame />
    </PinnedScenarioProvider>
  );
}
