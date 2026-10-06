/**
 * Validation bounds — Epic 1 §9, the one table every rule in the product is
 * written from.
 *
 * They live below the data layer because both ends of every one of these rules
 * need them: the Zod schema in `@syn/validators` that rejects the value, and
 * the form leaf that sets `maxLength` and renders the counter. A bound
 * enforced in one place and re-typed in the other is a bound that drifts.
 */

/** Habit name — Epic 1 §9, *Give it a name.* */
export const HABIT_TITLE_MAX = 60;

/** Template name — *Name this template.* */
export const TEMPLATE_NAME_MAX = 40;

/** Category name; unique per user — *You already have a category called this.* */
export const CATEGORY_NAME_MAX = 24;

/** Reason label; unique per user — *You already have this reason.* */
export const REASON_LABEL_MAX = 40;

/** Preflight note on a habit (`habits.default_notes_preflight`). */
export const PREFLIGHT_NOTE_MAX = 280;

/** The optional note on a miss — Epic 3 DR-03 (`misses.note`). */
export const MISS_NOTE_MAX = 280;

/** One reflection axis label, e.g. "focus". */
export const REFLECTION_AXIS_MAX = 24;

/** At most two axes per habit — official spec §3.3. */
export const REFLECTION_AXES_MAX = 2;

/** Quantity unit, e.g. "pages", "reps". */
export const QUANTITY_UNIT_MAX = 16;

/** Duration range, in minutes — *"From" should be less than or equal to "to".* */
export const DURATION_MIN = 1;
export const DURATION_MAX = 480;

/** Life priority and every 1–7 stepper — *Pick a number — 7 is most important.* */
export const PRIORITY_MIN = 1;
export const PRIORITY_MAX = 7;

/**
 * Template weekly target. The form's stepper runs 0–7 (Epic 1 §9) where 0 is
 * *none*; the stored column is null for *none* and otherwise 1–7 (SET-1's
 * `CHECK`), so `WEEKLY_TARGET_MIN` is the lowest value that is ever written.
 */
export const WEEKLY_TARGET_MIN = 1;
export const WEEKLY_TARGET_MAX = 7;

/** Shift amount, in minutes — official spec §5.6. */
export const SHIFT_MIN = 5;
export const SHIFT_MAX = 600;

/** Capacity for a trim, in minutes — official spec §5.8. */
export const CAPACITY_MIN = 5;
export const CAPACITY_MAX = 1440;

/** Password — *Passwords need at least 8 characters.* */
export const PASSWORD_MIN = 8;

/** Display name — *Add a name — it's just what the app calls you.* */
export const DISPLAY_NAME_MAX = 40;

/** Free-text note on an item. */
export const NOTE_MAX = 500;

/** About → Feedback message — cross-cutting SY-01. */
export const FEEDBACK_MAX = 1000;

/** Free-entry miss reason behind *Other* — Epic 3 DR-03. */
export const OTHER_REASON_MAX = 80;

/*
 * ---- UX v1.1 (§11, §3.11, §5.2, §6.5, §6.6, §7.2) ----
 */

/** A gap before a slot, in minutes — `template_slots.gap_before_min`, 0–240 (§11.5). */
export const GAP_MAX = 240;

/** *Today's intention* — `days.intention` (§11.7). */
export const INTENTION_MAX = 140;

/** *Grateful for, this morning* — `days.morning_gratitude` (§11.7). */
export const MORNING_GRATITUDE_MAX = 280;

/** One journal answer — `journal_entries.answers[key]` (§7.2, TD-7). */
export const JOURNAL_ANSWER_MAX = 2000;

/** One journal prompt's label (§4.10). */
export const JOURNAL_PROMPT_MAX = 60;

/** How many prompts a person may keep (§4.10). */
export const JOURNAL_PROMPTS_MAX = 10;

/** A fixture's title — `fixtures.title` (§11.6). */
export const FIXTURE_TITLE_MAX = 60;

/** A work focus's title — a `deep_work` habit (§3.8). */
export const FOCUS_TITLE_MAX = 40;

/** A workout's title — a `workout` habit (§3.7). */
export const WORKOUT_TITLE_MAX = 40;

/**
 * The one behaviour line (§5.2, R18) appears at most once in this many days,
 * and only on the second consecutive skipped gratitude.
 */
export const SKIP_LINE_WINDOW_DAYS = 7;

/**
 * The quiet Adjust offer (§6.6) appears when the orient frame opened at least
 * this many minutes after the wake target, on a day set the night before with
 * a hard anchor. Never on an unset day.
 */
export const LATE_WAKE_OFFER_MIN = 30;

/** Drags on the Schedule and in the block editor snap to this (§6.5, §3.11). */
export const DRAG_SNAP_MIN = 5;

/** A long-press lifts a block (§3.11, §6.5). */
export const LONG_PRESS_MS = 300;

/*
 * ---- UX v1.2 — the first run rebuilt (RUN-1) ----
 */

/** A passage's title — `passages.title` (v1.2 §11.4). */
export const PASSAGE_TITLE_MAX = 80;
/** A passage's Markdown body (v1.2 §11.4). */
export const PASSAGE_BODY_MAX = 8000;
/** Images per passage (v1.2 §3.12). */
export const PASSAGE_IMAGES_MAX = 4;
/** Tags per passage, and a tag's length (v1.2 §11.4). */
export const PASSAGE_TAGS_MAX = 10;
export const PASSAGE_TAG_MAX = 24;
/** Versions per habit (v1.2 R34), and a version's label. */
export const HABIT_VERSIONS_MAX = 3;
export const VERSION_LABEL_MAX = 20;
/** Minutes there or back around a workout (v1.2 §11.2). */
export const TRAVEL_MAX = 180;
/** The morning's third line — `days.visualisation` (v1.2 §11.1). */
export const VISUALISATION_MAX = 280;
/** A day plan's name — `day_plans.name` (v1.2 §11.5). */
export const DAY_PLAN_NAME_MAX = 40;
/** A stepper commits this long after the last tap (v1.2 §2 guardrail 4, TD-18). */
export const STEPPER_COMMIT_DEBOUNCE_MS = 400;
/** The journal reminder's derived default: this many minutes before phone away (v1.2 §4.11). */
export const JOURNAL_REMINDER_OFFSET_MIN = 60;
/** Phone away's derived default: this many minutes before lights out (v1.2 §13 #25). */
export const DEVICES_OFF_OFFSET_MIN = 60;
/** The passage and quote cycles count days from this date (v1.2 §3.12, RUN-4). */
export const CYCLE_EPOCH = "2026-01-01";

/*
 * ---- UX v1.3 — the first run built day-first (DAY-3) ----
 */

/** A link's title — `links.title` (v1.3 §3.17, §11.4). */
export const LINK_TITLE_MAX = 80;
/** A link's URL — `links.url` (v1.3 §11.4). */
export const LINK_URL_MAX = 2048;
/** A fixture's place — `fixtures.location`, free text (v1.3 §3.14, §11.3). */
export const FIXTURE_LOCATION_MAX = 80;
