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

/**
 * The earliest a template slot may start, in minutes before the anchor —
 * Epic 1 TP-02 ("up to two hours before"). Stored as `offset_start_min >= -120`.
 */
export const TEMPLATE_OFFSET_MIN = -120;

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
