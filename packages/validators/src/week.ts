import { z } from "zod";

import {
  DURATION_MAX,
  DURATION_MIN,
  HABIT_TITLE_MAX,
  PRIORITY_MAX,
  PRIORITY_MIN,
} from "@syn/constants";

import { blockKindSchema, dayShapeSchema } from "./block";
import { dateKeySchema, weekKeySchema } from "./keys";
import { clockTimeSchema } from "./preferences";
import { schedulingSchema, timeModeSchema } from "./template";

/** WK-01/02/03's inputs. */

/**
 * One block's assignment on one day — UX v1.1 §4.13, §11.11 (DYN-5).
 *
 * `templateId` null is a block with no template (an empty wind-down on an
 * unstructured day, a training block whose workout is decided at the pick);
 * `"pool"` is *decide in the morning* — the block exists and holds nothing
 * until *Set the day*.
 */
export const blockAssignmentSchema = z.object({
  kind: blockKindSchema,
  templateId: z.union([z.string().uuid(), z.literal("pool")]).nullable(),
});

export type BlockAssignmentInput = z.infer<typeof blockAssignmentSchema>;

export const assignBlocksInput = z.object({
  date: dateKeySchema,
  blocks: z.array(blockAssignmentSchema).max(16),
  shape: dayShapeSchema.optional(),
  /** The week's focus for a work day; null clears it. */
  focusHabitId: z.string().uuid().nullable().optional(),
});

export type AssignBlocksInput = z.infer<typeof assignBlocksInput>;

export const prefillWeekInput = z.object({ week: weekKeySchema });

/** The training swap between two days of the build — v1.1 §4.13, R25 (DYN-12). */
export const tradeWorkoutsInput = z
  .object({ date: dateKeySchema, withDate: dateKeySchema })
  .refine((value) => value.date !== value.withDate, {
    // [COPY — needs Vesper sign-off]
    message: "Pick another day.",
    path: ["withDate"],
  });

export type TradeWorkoutsInput = z.infer<typeof tradeWorkoutsInput>;

/** The profile's default plan for a date — the *Structured* toggle's read (DYN-12). */
export const defaultPlanInput = z.object({ date: dateKeySchema });

/** The day sheet's *Plan* row — UX v1.2 §4.15 (RUN-13): a plan on a date, or `null` for *Unstructured*. */
export const applyPlanInput = z.object({ date: dateKeySchema, planId: z.string().uuid().nullable() });

export type ApplyPlanInput = z.infer<typeof applyPlanInput>;

export const applyTemplateInput = z.object({
  date: dateKeySchema,
  templateId: z.string().uuid(),
  /** Absent means the template's own start (WK-02's helper is literal). */
  anchorTime: clockTimeSchema.optional(),
});

export const changeAnchorInput = z.object({
  date: dateKeySchema,
  anchorTime: clockTimeSchema,
});

export const weekInput = z.object({ week: weekKeySchema });

export const copyWeekInput = z.object({
  week: weekKeySchema,
  /** The extra confirmation: replace days that are already planned. */
  overwrite: z.boolean(),
});

export const applyChangesInput = z.object({
  templateId: z.string().uuid(),
  scope: z.enum(["all", "from_tomorrow", "none"]),
});

/**
 * A one-off.
 *
 * `habitId` null with a title is *Just a title* — an item that exists on this
 * day and nowhere else, which the helper says plainly: "It won't be added to
 * your habits."
 */
export const oneOffFormSchema = z
  .object({
    date: dateKeySchema,
    itemId: z.string().uuid().optional(),
    habitId: z.string().uuid().nullable(),
    title: z
      .string()
      .trim()
      .max(HABIT_TITLE_MAX)
      .default(""),
    timeMode: timeModeSchema,
    startClock: clockTimeSchema.nullable(),
    endClock: clockTimeSchema.nullable(),
    durationMin: z
      .number()
      .int()
      .min(DURATION_MIN)
      .max(DURATION_MAX)
      .nullable(),
    priority: z.number().int().min(PRIORITY_MIN).max(PRIORITY_MAX),
    scheduling: schedulingSchema,
    multitaskWith: z.string().uuid().optional(),
  })
  .superRefine((value, ctx) => {
    // One of the two: a habit, or a title of your own.
    if (value.habitId === null && value.title.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["title"],
        message: "Give it a title.",
      });
    }

    if (value.timeMode === "fixed_time" && value.startClock === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startClock"],
        message: "Pick a time.",
      });
    }

    if (value.timeMode === "window") {
      if (value.startClock === null || value.endClock === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endClock"],
          message: "Pick a window.",
        });
        return;
      }
      if (value.endClock <= value.startClock) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endClock"],
          message: "The window ends before it starts.",
        });
      }
    }
  });

export type OneOffFormInput = z.infer<typeof oneOffFormSchema>;

export const removeOneOffInput = z.object({ id: z.string().uuid() });
export const dayDateInput = z.object({ date: dateKeySchema });
