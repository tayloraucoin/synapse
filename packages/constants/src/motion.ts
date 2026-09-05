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
