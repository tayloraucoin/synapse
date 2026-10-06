/**
 * Presentational unions — what a surface renders, not what a row stores.
 * Derived per render, never stored.
 *
 * Fixed by the v2 component handoff §3.5 (`types/ui-state.ts`), which every §5
 * component entry references. Copied as written.
 *
 * Spelling rule (handoff §3.2 R8): presentational unions are kebab-case, so a
 * value chosen by a component can never be mistaken for a value read from a
 * column. Schema-shaped unions live in `domain.ts`.
 */

/**
 * Official spec §5.9 row/block matrix + Epic 2 §2 additions + UX v1.1 §10.1:
 * `moved` (an upcoming item whose planned start differs from its original —
 * a re-plan, counted never scored), `confirm-later` (a wind-down item after
 * devices-off, confirmed the next morning), `not-confirmed` (left unticked).
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
  | "deferred"
  | "carried"
  | "not-assigned"
  | "cut-by-shift"
  | "missed"
  | "pending-review"
  | "moved"
  | "confirm-later"
  | "not-confirmed";

/** Where a row sits inside a multitask group's bracket — official spec §9.7. */
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
  | "from"
  | "not-today"
  | "add-unit"
  | "updated"
  | "pending"
  | "archived"
  /** UX v1.1 §7.1 — the caption on a wind-down row after devices-off. */
  | "confirm-later"
  /** UX v1.1 §3.11 — the role captions in an opener · pool · closer routine. */
  | "opener"
  | "closer";

/** Cross-cutting §8.2 — the live day, a past day as a record, a future day as a plan. */
export type DayMode = "live" | "record" | "plan";

/** One break at 768px — cross-cutting §2.1. */
export type Layout = "compact" | "wide";

/** The canvas autosave indicator — Epic 1 §10. */
export type SaveStatus = "idle" | "saving" | "saved" | "retrying" | "failed";

/** Which Day Review the person is in — Epic 3 DR-01. */
export type ReviewMode = "live" | "pending" | "edit";

/** An undone item's panel state in the Day Review — Epic 3 DR-02, DR-05. */
export type DecisionState =
  | "undecided"
  | "deciding"
  | "decided"
  | "pending"
  | "resolved-by-shift"
  | "changed";

/** One square in the Week Review's seven-day habit strip — Epic 3 WR-01 §6. */
export type StripState =
  | "done"
  | "done-moved"
  | "not-counted"
  | "half"
  | "didnt-do"
  | "not-assigned"
  | "pending"
  /** UX v1.1 §7.3, R16 — a wind-down item left unticked: blank, labelled, excluded. */
  | "not-confirmed";

/**
 * A whole week of squares — Monday to Sunday, always exactly seven.
 *
 * A TUPLE, NOT AN ARRAY. `HabitStrip` draws seven squares and its prop says so;
 * a plain `StripState[]` forced every caller to cast, which is the type system
 * being talked out of a length invariant the read models actually guarantee
 * (`weekDates` returns seven keys, and the builders map over them). Named once,
 * a six-day week fails to compile rather than failing to render.
 */
export type StripWeek = readonly [
  StripState,
  StripState,
  StripState,
  StripState,
  StripState,
  StripState,
  StripState,
];

/** The item timer — official spec §5.4. */
export type TimerStatus = "idle" | "running" | "paused";

/** Which status line is showing under the header. One slot, one line at a time. */
export type StatusLineVariant =
  | "offline"
  | "syncing"
  | "sync-issues"
  | "setup"
  | "pending-review"
  | "late-offer"
  | "update"
  | "timezone"
  | "install"
  | "permission"
  /** UX v1.1 §6.6 — the one quiet Adjust offer after a late wake, once a day. */
  | "late-wake-offer";

/**
 * Notification permission as the interface reasons about it — official spec
 * §8.3. `not-installed` is iOS before the app is added to the home screen,
 * where push does not exist yet; the app says so plainly and never re-prompts
 * after `denied`.
 */
export type PermissionState =
  | "granted"
  | "denied"
  | "not-asked"
  | "unsupported"
  | "not-installed";

/** The three steps of the shift sheet — official spec §5.6, Epic 2 SF-01. */
export type ShiftStep = 1 | 2 | 3;

/*
 * ---- UX v1.1 additions ----
 */

/** The four steps of the Adjust sheet — v1.1 §6.6. */
export type AdjustStep = 1 | 2 | 3 | 4;

/** Where the Adjust sheet was opened from; it preselects the reason chip. */
export type AdjustEntry = "late-offer" | "header" | "one-off" | "band-drag";

/** The drag layer's states on the Schedule and in the block editor — v1.1 §6.5, §10.2. */
export type DragState = "idle" | "lifted" | "dropping" | "refused" | "confirming";

/** The sections of the quick-pick, in the order they appear — v1.1 §5.3. */
export type QuickPickSectionKind =
  | "last-night"
  | "shape"
  | "routine"
  | "prep"
  | "training"
  | "work"
  | "fixtures";

/**
 * The budget line's relation to its budget — v1.1 §5.3. Three states, one
 * treatment: the second number is the feedback, and the line never changes
 * colour.
 */
export type BudgetState = "under" | "exact" | "over";
