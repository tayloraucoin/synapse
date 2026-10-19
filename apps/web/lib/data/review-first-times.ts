/**
 * Review the day's one-time lines (USE-37): the rail +'s hint on the first
 * mornings (D-USE-18; first-mornings.md) and the first-change line
 * (first-edit.md). Each is kept by `useDismissed` at the `forever` scope,
 * the one mechanism for a line that goes for good.
 */

/** The + hint: until Got it or the first drag, never again on any morning. */
export const RAIL_HINT = "review-rail-hint";

/** "Changes apply to today…": shown on the first change ever, then never. */
export const FIRST_CHANGE = "review-first-change";

/** What the person did with the + while its hint shows. */
export type RailHintAction = "tap" | "drag" | "got-it";

/**
 * D-USE-18: a drag or Got it dismisses the hint; a tap alone does not
 * (first-mornings.md [ASSUMPTION]), it opens the add sheet with the hint kept.
 */
export function dismissesRailHint(action: RailHintAction): boolean {
  return action !== "tap";
}

/**
 * The first-change line on this visit: shown from the first change when no
 * change was ever made here before, and it stays for the rest of the visit
 * [ASSUMPTION, first-edit.md]; `seenBefore` is read when the visit began.
 */
export function showsFirstChangeLine({
  seenBefore,
  changedThisVisit,
}: {
  seenBefore: boolean;
  changedThisVisit: boolean;
}): boolean {
  return changedThisVisit && !seenBefore;
}
