/**
 * Presentational unions — what a surface renders, not what a row stores.
 *
 * Spelling rule (v2 handoff §3.2 R8): presentational unions are kebab-case, so
 * a value chosen by a component can never be mistaken for a value read from a
 * column. Schema-shaped unions live in `domain.ts`.
 *
 * Sources: official UX spec §5.9 (the state matrix), Epic 2 §2/§6, Epic 3
 * §DR-02/§WR-01, cross-cutting §2.1/§4.2/§5.4/§6.2/§8.2, Epic 1 §10.
 */

/**
 * The item card's rendered state — official spec §5.9, both tabs, one card.
 * Derived at read time from `completion_state`, `assignment_state`, the clock,
 * and `done_at`; never stored.
 */
export type ItemState =
  | "upcoming"
  | "soon"
  | "now"
  | "open"
  | "closing"
  | "active"
  | "passed"
  | "done"
  | "done-off-schedule"
  | "not-today"
  | "carried"
  | "not-assigned"
  | "cut-by-shift"
  | "missed"
  | "pending-review";

/**
 * Where a row sits inside a multitask group's bracket — official spec §9.7
 * (`ItemRow` props). `none` is the ordinary single row.
 */
export type MultitaskPosition = "none" | "first" | "middle" | "last";

/**
 * The word in a row's state-word slot — Epic 2 §0.3 fixes the vocabulary and
 * §2 LS-01 fixes the slot. Exactly one word, or none.
 */
export type StateWordKind =
  | "now"
  | "soon"
  | "open"
  | "closing"
  | "moved"
  | "carried"
  | "not-today"
  | "add-quantity"
  | "undo";

/**
 * How a day renders — cross-cutting §8.2. `today` is the live day; `record` is
 * a past day (no now line, no Day Complete, edits are stamped); `plan` is a
 * future day (no checkboxes, one door back to the week build).
 */
export type DayMode = "today" | "record" | "plan";

/**
 * The one breakpoint — cross-cutting §2.1. Compact under 768px, wide at 768px
 * and above. Container placement, rail vs. tab bar, and canvas widths change;
 * copy, order, states, and actions do not.
 */
export type Layout = "compact" | "wide";

/**
 * The canvas autosave indicator — Epic 1 §10. Canvases autosave per change and
 * show *Saving… / Saved / Not saved — retrying*; form sheets save on the
 * primary and never show this.
 */
export type SaveStatus = "idle" | "saving" | "saved" | "retrying";

/**
 * Which Day Review the person is in — Epic 3 DR-01. `review` closes the day,
 * `pending` decides items an auto-close left behind, `edit` revises a day
 * already reviewed.
 */
export type ReviewMode = "review" | "pending" | "edit";

/**
 * An undone item's panel state in the Day Review — Epic 3 DR-02. `pending`
 * renders identically to `undecided`; the day is closed, so the second line
 * adds the word.
 */
export type DecisionState = "undecided" | "deciding" | "decided" | "pending";

/**
 * One square in the Week Review's seven-day habit strip — Epic 3 WR-01 §6.
 * Every square carries an accessible label; the glyph is never the only
 * carrier of the distinction.
 */
export type StripState =
  | "done"
  | "done-moved"
  | "not-counted"
  | "planned-wrong"
  | "didnt-do"
  | "not-assigned"
  | "pending";

/**
 * The item timer — official spec §5.4. Stop does not mark done, and done does
 * not require a timer; each run is its own `timer_session`.
 */
export type TimerStatus = "idle" | "running" | "paused" | "stopped";

/**
 * Which status line is showing under the header — cross-cutting §5.4, §6.2,
 * §7.3, §10 (SY-02, SY-06, SY-07), Epic 2 §3.6, Epic 3 RV-00. One slot, one
 * line at a time.
 */
export type StatusLineVariant =
  | "offline"
  | "syncing"
  | "sync-failed"
  | "update-available"
  | "timezone-mismatch"
  | "install-available"
  | "pending-review"
  | "late-offer"
  | "resume-setup";

/**
 * Notification permission as the interface reasons about it — official spec
 * §8.3. `unsupported` is iOS-before-install and any browser without push; the
 * app states it plainly and never re-prompts after `denied`.
 */
export type PermissionState =
  | "default"
  | "granted"
  | "denied"
  | "unsupported";

/** The three steps of the shift sheet — official spec §5.6, Epic 2 SF-01. */
export type ShiftStep = "amount" | "reason" | "fit";
