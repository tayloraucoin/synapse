/**
 * Schema-shaped unions — the vocabulary the database, the API, and the future
 * Expo app all spell the same way.
 *
 * Fixed by the v2 component handoff §3.5 (`types/domain.ts`), which every §5
 * component entry references. Copied as written; the only additions are the
 * schema unions below the divider, which the handoff does not fix because no
 * component renders them.
 *
 * Spelling rule (handoff §3.2 R8): a union that names a stored column value
 * keeps the schema's spelling (snake_case). Presentational unions are
 * kebab-case and live in `ui-state.ts`. The two never mix, so a value read from
 * a row is never silently comparable to a value chosen by a component.
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
  | "carried"
  | "calendar_import";

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

/**
 * Habit.icon — §3.3, shaped by handoff §3.5 as a discriminated union so a
 * caller cannot read `colorKey` off an emoji. `image` carries the storage path;
 * the URL is resolved by the caller, never by `@syn/ui`.
 */
export type IconValue =
  | { kind: "emoji"; value: string }
  | { kind: "curated"; value: string; colorKey: CategoryKey | null }
  | { kind: "image"; value: string };

/** TimerSession.source — §3.7. */
export type TimerSessionSource = "timer" | "manual";

/*
 * Below: schema unions the handoff does not fix, because no component in §5
 * renders them. They are here rather than in `@syn/db` because the API and the
 * scheduler both spell them, and neither should reach for a Drizzle enum.
 */

/** Day.close_reason — official spec §3.6. */
export type DayCloseReason = "manual" | "auto";

/** WeekPlan.status — §3.6. */
export type WeekPlanStatus = "unplanned" | "planned";

/** Miss.resolved_by — §3.8. */
export type MissResolvedBy = "day_review" | "shift";

/** Day.woke_at_source — Epic 2 DH-02: set by the wake anchor, or by hand. */
export type WokeAtSource = "anchor" | "manual";

/**
 * NotificationPref.kind — the nine rows of official spec §8.2, N1…N9 in order.
 * The catalogue itself (defaults, phase) is `NOTIFICATION_CATALOGUE` in
 * `@syn/constants`; the titles and bodies are USE-8's payload builder.
 */
export type NotificationKind =
  | "item_start"
  | "window_open"
  | "window_closing"
  | "review_reminder"
  | "pending_review"
  | "week_build"
  | "week_ready"
  | "timer_running"
  | "calendar_item";

/** DataExport.status — official spec §7.6, Epic 1 ST-10. */
export type ExportStatus = "preparing" | "ready" | "expired" | "failed";
