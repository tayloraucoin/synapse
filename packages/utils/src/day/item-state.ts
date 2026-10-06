import type {
  AssignmentState,
  CompletionState,
  DayMode,
  ItemState,
  TimeMode,
} from "@syn/types";

/**
 * THE state function. One implementation, called by the API for first paint
 * and by the client every minute — so a row never disagrees with itself.
 *
 * ORDER IS THE DESIGN. The list below is a precedence, not a set of
 * conditions, and it runs top to bottom with the first match winning. The
 * facts about what happened to an item (it was trimmed, it was cut, it is
 * done) outrank the facts about where the clock is, because a done item at
 * 7:00 is done, not *now*.
 *
 * `passed` IS NOT `missed`. Nothing here ever returns `missed` from a clock —
 * only from a stored `completion_state`, which the Day Review writes. Time
 * passing is not a verdict (official spec §7.2: auto-close leaves items
 * pending, never missed).
 */

/** Official spec §6.2 — the fifteen minutes before a fixed start. */
export const SOON_MINUTES = 15;

/** §6.7 — a window is *closing* at the greater of 10% or 10 minutes left. */
export function closingThresholdMin(windowMin: number): number {
  return Math.max(10, Math.round(windowMin * 0.1));
}

export type ItemStateInput = {
  assignmentState: AssignmentState;
  completionState: CompletionState;
  timeMode: TimeMode;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  originalScheduledStart: Date | null;
  doneAt: Date | null;
  deferredAt: Date | null;
  /** True while a timer session on this item has no `ended_at`. */
  hasRunningSession: boolean;
  /*
   * ---- UX v1.1 (§7.1, §7.3, §10.1) — the two facts the three new states
   * read. Optional so the v1.0 callers that never see a wind-down block
   * (the shift preview, the resolver's inputs) keep their shape.
   */
  /** A wind-down item at or after the devices-off pin — confirmed next morning. */
  isAfterDevicesOff?: boolean;
  /** A pin — the anchor glyph; never `moved`, because it never moves (R3). */
  pinned?: boolean;
};

/**
 * Off-schedule is derived, never stored (official spec §6.3): `done_at`
 * outside `[original_scheduled_start, scheduled_end]`.
 *
 * A shifted item's `scheduled_start` moves and its `original_scheduled_start`
 * does not, so an item done on the shifted schedule still reads as
 * off-schedule against the plan. That is honest, and it is why a shift asks
 * for a reason.
 */
export function isOffSchedule(item: ItemStateInput): boolean {
  if (item.doneAt === null) return false;
  const from = item.originalScheduledStart;
  const to = item.scheduledEnd;
  if (from === null && to === null) return false;

  const doneMs = item.doneAt.getTime();
  if (from !== null && doneMs < from.getTime()) return true;
  if (to !== null && doneMs > to.getTime()) return true;
  return false;
}

export function deriveItemState(
  item: ItemStateInput,
  day: { closedAt: Date | null; mode: DayMode },
  now: Date,
): ItemState {
  // What happened to the item, before where the clock is.
  if (item.assignmentState === "not_assigned") return "not-assigned";
  if (item.assignmentState === "cut_by_shift") return "cut-by-shift";
  if (item.completionState === "pending_review") return "pending-review";
  if (item.completionState === "carried") return "carried";
  if (item.completionState === "missed") return "missed";
  // UX v1.1 R16 — left unticked the next morning. What happened outranks the
  // clock, as with every state above.
  if (item.completionState === "not_confirmed") return "not-confirmed";

  if (item.doneAt !== null || item.completionState === "done") {
    return isOffSchedule(item) ? "done-off-schedule" : "done";
  }

  if (item.deferredAt !== null) return "deferred";
  if (item.hasRunningSession) return "active";

  /*
   * UX v1.1 §7.1, §7.3 — after the phone goes away nothing is ticked live.
   * The row reads *confirm in the morning* from the moment the day is set
   * until the next morning's pick resolves it (done, or not-confirmed above),
   * whatever the clock says: a passed-but-unconfirmed item is still waiting
   * for its answer, not missed. A closed day's `pending_review` outranks it
   * above, so the Day Review's own state wins there.
   */
  if (item.isAfterDevicesOff === true) return "confirm-later";

  // A day that is not live has no now, soon, open, or closing — those describe
  // a clock running inside the day, and on a record or a plan day it is not.
  if (day.mode !== "live") {
    if (day.mode === "record" && day.closedAt !== null) return "pending-review";
    return day.mode === "record" ? "passed" : "upcoming";
  }

  // Unscheduled items are never now or soon (§6.2).
  if (item.timeMode === "unscheduled") return "upcoming";

  const nowMs = now.getTime();

  if (item.timeMode === "window") {
    const start = item.scheduledStart?.getTime() ?? null;
    const end = item.scheduledEnd?.getTime() ?? null;
    if (start === null || end === null) return "upcoming";

    if (nowMs >= end) return "passed";
    if (nowMs < start) return "upcoming";

    const windowMin = Math.round((end - start) / 60000);
    const remainingMin = Math.round((end - nowMs) / 60000);
    return remainingMin <= closingThresholdMin(windowMin) ? "closing" : "open";
  }

  const start = item.scheduledStart?.getTime() ?? null;
  const end = item.scheduledEnd?.getTime() ?? null;
  if (start === null) return "upcoming";

  if (end !== null && nowMs >= end) return "passed";
  if (nowMs >= start) return end === null ? "passed" : "now";
  if (nowMs >= start - SOON_MINUTES * 60000) return "soon";
  return isMoved(item) ? "moved" : "upcoming";
}

/**
 * UX v1.1 §10.1 — an upcoming item whose planned start is not where the plan
 * put it: a *Do now*, an Adjust, a drag. Counted in the header's plain words,
 * never scored. Only while upcoming: once it is *soon* or *now* the clock is
 * the more useful word, and a pin never moves, so a pin is never moved.
 */
export function isMoved(item: ItemStateInput): boolean {
  if (item.pinned === true) return false;
  if (item.scheduledStart === null || item.originalScheduledStart === null) {
    return false;
  }
  return item.scheduledStart.getTime() !== item.originalScheduledStart.getTime();
}
