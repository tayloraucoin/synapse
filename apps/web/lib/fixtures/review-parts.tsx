"use client";

import { ReviewDayFrame } from "@/app/(shell)/today/review/_components";
import { PinnedScenarioProvider } from "@/lib/data/source";

/** Review the day's frames (USE-31), one scenario each, for the capture host. */
export type ReviewPartState = "success" | "tray-open";

export function ReviewPart({ state }: { state: ReviewPartState }) {
  return (
    <PinnedScenarioProvider value={`review-${state}`}>
      <ReviewDayFrame />
    </PinnedScenarioProvider>
  );
}
