/**
 * Schema-shaped unions — the vocabulary the database, the API, and the future
 * Expo app all spell the same way.
 *
 * Spelling rule (v2 handoff §3.2 R8): a union that names a stored column value
 * keeps the schema's spelling (snake_case). Presentational unions are
 * kebab-case and live in `ui-state.ts`. The two never mix, so a value read from
 * a row is never silently comparable to a value chosen by a component.
 *
 * Source: official UX spec §3 (data model v2).
 */

/** Habit.type — official spec §3.3. */
export type ItemType = "habit" | "task_appointment" | "deep_work";

/** TemplateSlot.time_mode / DayItem.time_mode — §3.5, §3.7. */
export type TimeMode = "fixed_time" | "window" | "unscheduled";

/**
 * TemplateSlot.scheduling / DayItem.scheduling — §3.5.
 * Hard anchors never move under shift-forward (§5.6).
 */
export type Scheduling = "hard" | "soft";

/**
 * DayItem.assignment_state — §3.7. `not_assigned` is a capacity trim (§5.8);
 * `cut_by_shift` is a shift casualty (§5.6). Neither is a failure, and neither
 * is scored on its own.
 */
export type AssignmentState = "assigned" | "not_assigned" | "cut_by_shift";

/** DayItem.completion_state — §3.7. */
export type CompletionState =
  | "upcoming"
  | "active"
  | "done"
  | "missed"
  | "carried"
  | "pending_review";

/**
 * Miss.tier — §3.8. The resolver (§7.3) reads exactly these three:
 * `circumstance` is excluded, `scoping` credits half, `chose_not_to` credits 0.
 */
export type MissTier = "circumstance" | "scoping" | "chose_not_to";

/**
 * DayItem.origin — §3.7. The spec writes the last two with a payload
 * (`carried_from(day_item_id)`, `calendar_import(event_id)`); the payload is a
 * sibling column, so the union carries the kind alone.
 */
export type ItemOrigin =
  | "template"
  | "one_off"
  | "carried_from"
  | "calendar_import";

/** TimerSession.source — §3.7. */
export type TimerSessionSource = "timer" | "manual";

/**
 * Category.color_key — the eight category hues of official spec §9.3. Never the
 * accent teal and never the violet, so the semantic layer stays unambiguous.
 */
export type CategoryKey =
  | "leaf"
  | "sky"
  | "clay"
  | "rose"
  | "amber"
  | "slate"
  | "plum"
  | "moss";

/** Habit.icon.kind — §3.3. */
export type IconKind = "emoji" | "curated" | "custom";

/**
 * Habit.icon — §3.3. `value` is the emoji character, the curated glyph name, or
 * the storage path of an uploaded image, according to `kind`. `colorKey` tints
 * curated glyphs (§9.9) and is absent for emoji and custom images.
 */
export interface IconValue {
  kind: IconKind;
  value: string;
  colorKey?: CategoryKey;
}

/** Day.close_reason — §3.6. */
export type DayCloseReason = "manual" | "auto";

/** WeekPlan.status — §3.6. */
export type WeekPlanStatus = "unplanned" | "planned";

/** Miss.resolved_by — §3.8. */
export type MissResolvedBy = "day_review" | "shift";
