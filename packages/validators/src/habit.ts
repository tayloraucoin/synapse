import { z } from "zod";

import {
  DURATION_MAX,
  DURATION_MIN,
  FOCUS_TITLE_MAX,
  HABIT_TITLE_MAX,
  PREFLIGHT_NOTE_MAX,
  PRIORITY_MAX,
  PRIORITY_MIN,
  QUANTITY_UNIT_MAX,
  REFLECTION_AXES_MAX,
  REFLECTION_AXIS_MAX,
  WEEKLY_TARGET_MAX,
  WEEKLY_TARGET_MIN,
  WORKOUT_TITLE_MAX,
} from "@syn/constants";

import { blockKindSchema } from "./block";
import { weekdaySchema } from "./template";

/**
 * LB-02's rules, in one place.
 *
 * THE FORM AND THE PROCEDURE SHARE THIS SCHEMA, which is why the messages are
 * Epic 1 §9's copy verbatim rather than developer strings: the sentence a
 * person reads under a field is the same object the mutation rejects with.
 * Two schemas would be two chances for the server to refuse something the form
 * accepted, with no sentence to show for it.
 *
 * THE FORM NEVER SETS `type` (UX v1.1 §4.15, W6). The library sheet creates
 * habits; the training screen creates workouts; the focus screen creates
 * focuses; one-offs and fixtures have their own sheets. The calling procedure
 * sets the type, so the sheet called *Habits* only ever makes habits.
 */

/** The four stored types — read-side only; no form chooses one. */
export const habitTypeSchema = z.enum([
  "habit",
  "task_appointment",
  "deep_work",
  "workout",
]);

export type HabitTypeInput = z.infer<typeof habitTypeSchema>;

export const categoryKeySchema = z.enum([
  "leaf",
  "sky",
  "clay",
  "rose",
  "amber",
  "slate",
  "plum",
  "moss",
]);

/**
 * `IconValue` as a discriminated union — the same three arms `@syn/types`
 * declares. Discriminated rather than a loose object so a caller cannot send
 * `{ kind: "emoji", colorKey: "leaf" }` and have it stored.
 */
export const iconValueSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("emoji"), value: z.string().min(1).max(16) }),
  z.object({
    kind: z.literal("curated"),
    value: z.string().min(1).max(64),
    colorKey: categoryKeySchema.nullable(),
  }),
  z.object({ kind: z.literal("image"), value: z.string().min(1).max(512) }),
]);

export type IconValueInput = z.infer<typeof iconValueSchema>;

const durationBound = z
  .number()
  .int()
  .min(DURATION_MIN)
  .max(DURATION_MAX)
  .nullable();

/**
 * The habit form — a `habit`, always (see the header).
 *
 * The two cross-field rules live in `superRefine` because neither can be
 * expressed on a single field: the range is required for a habit (official
 * spec §3.3), and `from <= to` is a relationship.
 */
export const habitFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Give it a name.")
      .max(HABIT_TITLE_MAX, "Give it a name."),
    icon: iconValueSchema,
    categoryId: z.string().uuid().nullable(),
    /** The block this habit lives in by default; null = anywhere (v1.1 §11.3). */
    blockKind: blockKindSchema.nullable(),
    durationMinMin: durationBound,
    durationMaxMin: durationBound,
    lifePriority: z
      .number({ message: "Pick a number — 7 is most important." })
      .int()
      .min(PRIORITY_MIN, "Pick a number — 7 is most important.")
      .max(PRIORITY_MAX, "Pick a number — 7 is most important."),
    quantityUnit: z
      .string()
      .trim()
      .max(QUANTITY_UNIT_MAX)
      .nullable()
      .transform((value) => (value === "" ? null : value)),
    reflectionAxes: z
      .array(z.string().trim().min(1).max(REFLECTION_AXIS_MAX))
      .max(REFLECTION_AXES_MAX),
    defaultNotesPreflight: z
      .string()
      .trim()
      .max(PREFLIGHT_NOTE_MAX)
      .nullable()
      .transform((value) => (value === "" ? null : value)),
    /** The wake anchor lives on `users`; the form carries the person's intent. */
    isWakeAnchor: z.boolean(),
  })
  .superRefine((value, ctx) => {
    const missing =
      value.durationMinMin === null || value.durationMaxMin === null;

    if (missing) {
      // Reported on the "from" field, which is where the eye lands first.
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["durationMinMin"],
        message: "How long does it usually take? A rough range is fine.",
      });
      return;
    }

    if (
      value.durationMinMin !== null &&
      value.durationMaxMin !== null &&
      value.durationMinMin > value.durationMaxMin
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["durationMaxMin"],
        message: '"From" should be less than or equal to "to".',
      });
    }
  });

export type HabitFormInput = z.infer<typeof habitFormSchema>;

export const createHabitInput = habitFormSchema;

/** Edit sends the id alongside the same fields, so the rules cannot drift. */
export const updateHabitInput = z.object({
  id: z.string().uuid(),
  habit: habitFormSchema,
});

export type UpdateHabitInput = z.infer<typeof updateHabitInput>;

export const habitIdInput = z.object({ id: z.string().uuid() });

export const listHabitsInput = z
  .object({
    includeArchived: z.boolean().optional(),
    /** Only habits of this block (v1.1 §4.15); `null` for *anywhere*. */
    blockKind: blockKindSchema.nullable().optional(),
    /** Only these types — the block screens ask for workouts or focuses. */
    types: z.array(habitTypeSchema).min(1).optional(),
  })
  .optional();

/**
 * A workout or a focus — a habit with a rotation (UX v1.1 §3.7, §3.8, TD-3).
 * The calling procedure sets the type; the two screens share one shape.
 */
export const rotationHabitSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z
      .string()
      .trim()
      .min(1, "Give it a name.")
      .max(Math.max(WORKOUT_TITLE_MAX, FOCUS_TITLE_MAX), "Give it a name."),
    weeklyTarget: z
      .number()
      .int()
      .min(WEEKLY_TARGET_MIN)
      .max(WEEKLY_TARGET_MAX),
    /** The days it usually falls on; null or empty = decide in the morning. */
    typicalDays: z.array(weekdaySchema).max(7).nullable(),
    /** Workouts only — a typical length. Null for a focus. */
    durationMin: z
      .number()
      .int()
      .min(DURATION_MIN)
      .max(DURATION_MAX)
      .nullable(),
    lifePriority: z
      .number()
      .int()
      .min(PRIORITY_MIN)
      .max(PRIORITY_MAX)
      .default(6),
  })
  .refine(
    (value) => value.title.length <= WORKOUT_TITLE_MAX || value.durationMin === null,
    { message: "Give it a name.", path: ["title"] },
  );

export type RotationHabitInput = z.infer<typeof rotationHabitSchema>;

/**
 * The per-block starter library sends titles, not rows (v1.1 §12.4): the
 * server looks each title up in `STARTER_LIBRARY[blockKind]` and writes the
 * values IT holds.
 */
export const createFromStarterLibraryInput = z.object({
  blockKind: blockKindSchema,
  titles: z.array(z.string().min(1)).min(1),
});

export type CreateFromStarterLibraryInput = z.infer<
  typeof createFromStarterLibraryInput
>;

export const slotsOutsideRangeInput = z.object({
  id: z.string().uuid(),
  min: z.number().int().min(DURATION_MIN).max(DURATION_MAX),
  max: z.number().int().min(DURATION_MIN).max(DURATION_MAX),
});

/** The starter chooser sends the titles it offered, not rows it invented. */
export const createFromStarterSetInput = z.object({
  titles: z.array(z.string().min(1)).min(1),
});

export type CreateFromStarterSetInput = z.infer<
  typeof createFromStarterSetInput
>;
