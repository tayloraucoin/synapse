"use client";

import { NowScreen } from "@/app/(shell)/today/_components/now/now-screen";
import { ReminderPreview } from "@/components/planner";
import { PinnedScenarioProvider } from "@/lib/data/source";
import { TRAY_IDS } from "./scenarios/todos-tray";

/**
 * The to-do reminder on the lock screen (USE-19; notification.md): Monday at
 * 10:00, "Call the mechanic" in its own words. Not an app screen, so it is
 * reached here, `todos-notification`.
 */
export function TodosNotificationPart() {
  return (
    <div className="mx-auto w-full max-w-(--content-text)">
      <ReminderPreview
        todo={{ id: TRAY_IDS.mechanic, title: "Call the mechanic" }}
        dateLabel="Monday 12 October"
        clock="10:00"
      />
    </div>
  );
}

/** The tray's states on Now (USE-19), one scenario each, by its `?state=` name. */
export type TodosTrayPartState =
  | "todos-open"
  | "todos-carried"
  | "todos-empty"
  | "from-a-reminder"
  | "todos-loading"
  | "todos-error"
  | "todos-check-error"
  | "todos-offline";

export function TodosTrayPart({ state }: { state: TodosTrayPartState }) {
  return (
    <PinnedScenarioProvider value={state}>
      <NowScreen />
    </PinnedScenarioProvider>
  );
}
