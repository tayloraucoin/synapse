import { z } from "zod";

import {
  DURATION_MAX,
  DURATION_MIN,
  HABIT_TITLE_MAX,
  PREFLIGHT_NOTE_MAX,
  PRIORITY_MAX,
  PRIORITY_MIN,
  QUANTITY_UNIT_MAX,
  REFLECTION_AXES_MAX,
  REFLECTION_AXIS_MAX,
} from "@syn/constants";

/**
 * LB-02's rules, in one place.
 *
 * THE FORM AND THE PROCEDURE SHARE THIS SCHEMA, which is why the messages are
 * Epic 1 §9's copy verbatim rather than developer strings: the sentence a
 * person reads under a field is the same object the mutation rejects with.
 * Two schemas would be two chances for the server to refuse something the form
 * accepted, with no sentence to show for it.
 */

export const habitTypeSchema = z.enum(["habit", "task_appointment", "deep_work"]);

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
 * The habit form.
 *
 * The two cross-field rules live in `superRefine` because neither can be
 * expressed on a single field: the range is required for `habit` and
 * `deep_work` but optional for `task_appointment` (official spec §3.3), and
 * `from <= to` is a relationship. Doing them per field would either over-
 * report (a task told to give a range it does not need) or under-report.
 */
export const habitFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Give it a name.")
      .max(HABIT_TITLE_MAX, "Give it a name."),
    type: habitTypeSchema,
    icon: iconValueSchema,
    categoryId: z.string().uuid().nullable(),
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
    const rangeRequired =
      value.type === "habit" || value.type === "deep_work";
    const missing =
      value.durationMinMin === null || value.durationMaxMin === null;

    if (rangeRequired && missing) {
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
  .object({ includeArchived: z.boolean().optional() })
  .optional();

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
