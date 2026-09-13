/**
 * Motion and undo durations — official spec §9.6 (two durations, nothing else)
 * and §5.2/§5.6 (undo windows).
 *
 * Undo is inline and short by design (Epic 2 §0.1 rule 8): after the window,
 * the action is a fact, reversible only by another action.
 */

/** State changes — the checkbox mark, a row's treatment. */
export const DURATION_STATE_MS = 120;

/** Sheets and expansions. Under `prefers-reduced-motion` these crossfade. */
export const DURATION_SHEET_MS = 200;

/** Done / undone, inline in the state-word slot. */
export const UNDO_SHORT_MS = 5000;

/** Applying a template, and other one-tap materialisations. */
export const UNDO_LONG_MS = 10000;

/** A shift, which is a logged event once the window closes (§5.6). */
export const SHIFT_UNDO_WINDOW_MS = 600000;

/**
 * An Adjust (UX v1.1 §6.6) has the same window as the shift it generalises —
 * an alias, not a second value, so the two can never drift apart.
 */
export const ADJUST_UNDO_WINDOW_MS = SHIFT_UNDO_WINDOW_MS;

/**
 * The long-press that lifts a block on the Schedule and in the block editor
 * (UX v1.1 §3.11, §6.5). A mouse lifts on drag start; a finger holds this
 * long, so a scroll is never mistaken for a lift.
 */
export const DRAG_LONG_PRESS_MS = 300;

/** The live region's debounce on the quick-pick's budget line (UX v1.1 §10.4). */
export const BUDGET_LINE_ANNOUNCE_MS = 500;
