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

/**
 * Habit.type — official spec §3.3, plus `workout` (UX v1.1 §11.3, TD-3): a
 * workout is a habit with a rotation, not a table of its own. A *focus* is a
 * `deep_work` habit with the same two rotation columns.
 */
export type ItemType = "habit" | "task_appointment" | "deep_work" | "workout";

/*
 * ---- UX v1.1 — the block model's vocabulary (§1.4, §3, §11) ----
 *
 * Every union below names a stored column value and keeps the schema's
 * spelling. DYN-2 and DYN-3 check the database enums against them with
 * `enumValues<Union>()`, so a member added here and forgotten there is a type
 * error, not a value nobody can store.
 */

/** Block.kind — v1.1 §3.1, the eight kinds in their default order. */
export type BlockKind =
  | "orient"
  | "morning"
  | "training"
  | "prep"
  | "work"
  | "break"
  | "activity"
  | "wind_down";

/** Template.flow — v1.1 §3.3: forward from wake, or backward to an anchor. */
export type BlockFlow = "forward" | "backward";

/** Template.structure — v1.1 §3.4. */
export type BlockStructure = "stack" | "opener_pool_closer";

/** TemplateSlot.role — v1.1 §3.4; meaningful only under `opener_pool_closer`. */
export type SlotRole = "stack" | "opener" | "pool" | "closer";

/** Day.shape — v1.1 §3.9. Unstructured is a first-class shape, not an empty day. */
export type DayShape = "structured" | "unstructured";

/** DayBlock.state — v1.1 §11.7. `pooled` holds no items until the pick. */
export type DayBlockState = "planned" | "pooled" | "set" | "not_today";

/** DayBlock.placement — v1.1 §3.7; training and break only. */
export type TrainingPlacement =
  | "before_morning"
  | "after_morning"
  | "inside_work"
  | "after_work"
  | "in_break";

/** User.anchor_direction — v1.1 §3.3, "when your morning runs long, what gives?" */
export type AnchorDirection = "work_waits" | "routine_cut" | "depends";

/** User.overflow_mode — v1.1 §3.10. */
export type OverflowMode = "daily_menu" | "variants" | "auto_trim";

/**
 * One weekday's answer to "which days do you work?" — v1.1 §4.2, plus
 * `rarely` (UX v1.2 R40, TD-19): planned as a day off, the pick does not ask,
 * and the day header sheet offers *Working today* to apply a work-day type.
 */
export type WorkDayMode = "always" | "sometimes" | "rarely" | "never";

/** User.work_days — Mon = "0" … Sun = "6", matching `typical_days`. */
export type WorkDays = Record<"0" | "1" | "2" | "3" | "4" | "5" | "6", WorkDayMode>;

/** User.schedule_shape — v1.1 §4.1. Only the first is live in v1.1. */
export type ScheduleShape =
  | "own_structure_dynamic"
  | "consistent_shifts"
  | "varying_shifts"
  | "fluid";

/*
 * ---- UX v1.2 — the first run rebuilt (§1.4, §3, §11; TD-10…TD-20) ----
 */

/**
 * User.morning_mode — v1.2 R37, TD-17. `set_from_plan`: *Start the morning*
 * sets the day from the day plan and the quick-pick is skipped;
 * `build_each_morning`: the pick opens after orient, expanded.
 */
export type MorningMode = "set_from_plan" | "build_each_morning";

/** Template.location_kind — v1.2 §3.8, TD-14; a work-day type's kind. A label. */
export type WorkDayKind = "remote" | "coworking" | "office" | "other";

/**
 * Fixture.kind — v1.2 §3.6, R42. A label and a default glyph; nothing in
 * materialisation reads it.
 */
export type FixtureKind =
  | "meeting"
  | "appointment"
  | "class"
  | "event"
  | "social"
  | "chore"
  | "other";

/** Habit.location — v1.2 §3.7; workouts only. */
export type WorkoutLocation = "home" | "gym" | "outside";

/**
 * One of a habit's versions — v1.2 §3.5, R34, TD-11: a named length. Up to
 * three per habit; the first is the default the plan uses. Stored as a jsonb on
 * `habits`; the chosen version is snapshotted on the item as `version_key`.
 */
export type HabitVersion = {
  key: string;
  label: string;
  minutes: number;
};

/** DayPlan.state — v1.2 §3.13, TD-10. A plan left before the review stays a draft. */
export type DayPlanState = "draft" | "complete";

/** One workout placed by a day plan — v1.2 §4.13c; `training` on `day_plans`. */
export type DayPlanTraining = {
  habitId: string;
  placement: TrainingPlacement;
};

/** One break placed by a day plan — v1.2 §4.13f; `breaks` on `day_plans`. */
export type DayPlanBreak = {
  habitId: string;
  /** `"midday"`, or a clock time `HH:mm`. */
  at: "midday" | (string & {});
};

/** Shift.kind — v1.1 §11.9, TD-6: a slide of the anchor, or a re-fit that holds it. */
export type ShiftKind = "shift" | "refit";

/** One journal prompt — v1.1 §7.2; the person's own, editable, keyed stably. */
export type JournalPrompt = {
  key: string;
  label: string;
};

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

/**
 * DayItem.completion_state — §3.7, plus `not_confirmed` (UX v1.1 R16): a
 * wind-down item left unticked the next morning. Excluded from the number,
 * never hidden, resolvable from the Day Review.
 */
export type CompletionState =
  | "upcoming"
  | "active"
  | "done"
  | "missed"
  | "carried"
  | "pending_review"
  | "not_confirmed";

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
  | "calendar_import"
  /** UX v1.1 §3.6, TD-8 — a weekday fixture, materialised as a pin. */
  | "fixture"
  /**
   * UX v1.2 §3.7, TD-12 — the travel there or back around a workout, an item
   * of its own beside it; `parent_item_id` points at the workout.
   */
  | "travel";

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

/**
 * Day.woke_at_source — Epic 2 DH-02: set by the wake anchor, or by hand; and
 * `orient` (UX v1.1 R11): opening the orient frame is the wake moment. `anchor`
 * stays for the rows written under v1.0 — the record is never rewritten.
 */
export type WokeAtSource = "anchor" | "manual" | "orient";

/**
 * NotificationPref.kind — the nine rows of official spec §8.2, N1…N9 in order,
 * plus the three UX v1.1 §9.1 adds: `block_start` (N1a, one push per block
 * boundary), `fixture_start` (N1c), `devices_off` (N1d). `item_start` becomes
 * per-block and opt-in (R19). The catalogue itself (defaults, phase) is
 * `NOTIFICATION_CATALOGUE` in `@syn/constants`; the titles and bodies are the
 * payload builder's.
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
  | "calendar_item"
  | "block_start"
  | "fixture_start"
  | "devices_off"
  /**
   * UX v1.2 §9 N2, R38 — one push at `journal_reminder_time`, sent only when
   * the journal is on, the reminder is on, and tonight's entry is empty.
   */
  | "journal_reminder";

/** DataExport.status — official spec §7.6, Epic 1 ST-10. */
export type ExportStatus = "preparing" | "ready" | "expired" | "failed";
