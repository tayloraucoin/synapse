"use client";

import { ReviewDayFrame } from "@/app/(shell)/today/review/_components";
import { PinnedScenarioProvider } from "@/lib/data/source";

/** Review the day's frames (USE-31, USE-37, USE-38), one scenario each, for the capture host. */
export type ReviewPartState =
  | "success"
  | "tray-open"
  | "first-mornings"
  | "first-edit"
  | "after-swap-undo"
  | "no-work"
  | "late"
  | "late-passed-open";

export function ReviewPart({ state }: { state: ReviewPartState }) {
  return (
    <PinnedScenarioProvider value={`review-${state}`}>
      <ReviewDayFrame />
    </PinnedScenarioProvider>
  );
}

/** Finding minutes over Review the day (USE-41), `room-<state>`. */
export type RoomPartState = "make-room" | "later-cut" | "later-slide";

export function RoomPart({ state }: { state: RoomPartState }) {
  return (
    <PinnedScenarioProvider value={`room-${state}`}>
      <ReviewDayFrame />
    </PinnedScenarioProvider>
  );
}
