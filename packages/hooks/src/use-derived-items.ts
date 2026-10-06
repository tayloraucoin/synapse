import { useMemo } from "react";

import type { DayItemView, DayMode, ItemState } from "@syn/types";
import { deriveItemState } from "@syn/utils";

/**
 * Recompute every row's state against the current minute.
 *
 * THE SAME FUNCTION THE SERVER USED. `getDay` sets `state` for the first
 * paint; this runs `deriveItemState` over the same fields every time the
 * minute changes. One implementation, two callers — which is what stops a row
 * that arrived *soon* from still saying *soon* twenty minutes later, and stops
 * the client's idea of *now* from drifting from the server's.
 *
 * PLATFORM-PURE, so it lives in `@syn/hooks` rather than in the app: it reads
 * no DOM and no clock of its own — `now` is a parameter — so the Expo app gets
 * it unchanged. `useNow`, which does read `document`, stays web-only.
 */
export type DerivableItem = Pick<
  DayItemView,
  | "scheduledStart"
  | "scheduledEnd"
  | "originalScheduledStart"
  | "doneAt"
  | "timeMode"
  | "state"
> & {
  id: string;
  timerElapsedSec: number | null;
};

export type DerivedDayInput<TItem extends DerivableItem> = {
  mode: DayMode;
  closedAt: Date | null;
  items: readonly TItem[];
};

/**
 * The view carries a `state` but not the raw columns the state came from —
 * `assignment_state`, `deferred_at`, and whether a session is running are all
 * folded into it. Rather than widen the view, the previous state is read back
 * for the facts a clock cannot change.
 */
const CLOCK_INDEPENDENT: ReadonlySet<ItemState> = new Set([
  "not-assigned",
  "cut-by-shift",
  "pending-review",
  "carried",
  "missed",
  "deferred",
  "active",
  "done",
  "done-off-schedule",
  // UX v1.1 §7.1, §7.3 (DYN-15): a wind-down row after devices-off waits
  // for the morning whatever the clock says, and *not confirmed* is a record.
  "confirm-later",
  "not-confirmed",
]);

export function useDerivedItems<TItem extends DerivableItem>(
  day: DerivedDayInput<TItem>,
  now: Date,
): TItem[] {
  return useMemo(
    () =>
      day.items.map((item) => {
        // A fact about what happened does not change because a minute passed.
        if (CLOCK_INDEPENDENT.has(item.state)) return item;

        const state = deriveItemState(
          {
            assignmentState: "assigned",
            completionState: "upcoming",
            timeMode: item.timeMode,
            scheduledStart: item.scheduledStart,
            scheduledEnd: item.scheduledEnd,
            originalScheduledStart: item.originalScheduledStart,
            doneAt: item.doneAt,
            deferredAt: null,
            hasRunningSession: false,
          },
          { closedAt: day.closedAt, mode: day.mode },
          now,
        );

        return state === item.state ? item : { ...item, state };
      }),
    [day.items, day.closedAt, day.mode, now],
  );
}
