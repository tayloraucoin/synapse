import { z } from "zod";

import { DAY_PLAN_NAME_MAX } from "@syn/constants";

import {
  anchorDirectionSchema,
  dayPlanStateSchema,
  trainingPlacementSchema,
  workDayKindSchema,
} from "./block";
import { iconValueSchema } from "./icon";
import { clockTimeSchema } from "./preferences";
import { weekdaySchema } from "./template";

/**
 * A day plan — UX v1.2 §3.13, §4.13, §11.5 (TD-10): a row of references and
 * times, never a copy. The builder writes one part per screen through
 * `dayPlan.update`, so every field of the patch is optional and the object
 * refuses an empty patch.
 *
 * A weekday belongs to at most one plan per user — that rule is the
 * service's (an array cannot carry a unique constraint); the validator only
 * bounds the set.
 */

/** One placed workout — v1.2 §4.13c. */
export const dayPlanTrainingSchema = z.object({
  habitId: z.string().uuid(),
  placement: trainingPlacementSchema,
});

/** One break — v1.2 §4.13f: at midday, or at a clock time. */
export const dayPlanBreakSchema = z.object({
  habitId: z.string().uuid(),
  at: z.union([z.literal("midday"), clockTimeSchema]),
});

const weekdaysSchema = z
  .array(weekdaySchema)
  .max(7)
  .refine((days) => new Set(days).size === days.length, {
    message: "Each day once.",
  });

export const dayPlanPatchSchema = z
  .object({
    name: z.string().trim().min(1).max(DAY_PLAN_NAME_MAX).optional(),
    icon: iconValueSchema.nullable().optional(),
    weekdays: weekdaysSchema.optional(),
    /**
     * Null = *No work on this day*. v1.2's type picker; under v1.3 the plan
     * owns its work and the builder writes `work` below (TD-23).
     */
    workTemplateId: z.string().uuid().nullable().optional(),
    /**
     * UX v1.3 R46, §3.8, TD-23 (DAY-5) — the plan's own work: kind, *working
     * by*, *until about*, *what gives*. Each fact is optional because the
     * builder writes one per tap; the service creates the plan's work template
     * on the first and patches it after. `null` = *No work on this day*: the
     * reference goes and the plan's own template is archived.
     */
    work: z
      .object({
        kind: workDayKindSchema.nullable().optional(),
        workStart: clockTimeSchema.nullable().optional(),
        workEnd: clockTimeSchema.nullable().optional(),
        direction: anchorDirectionSchema.nullable().optional(),
      })
      .nullable()
      .optional(),
    /** Null = inherit from the profile / the type. */
    wakeTime: clockTimeSchema.nullable().optional(),
    workStartTime: clockTimeSchema.nullable().optional(),
    workEndTime: clockTimeSchema.nullable().optional(),
    lightsOutTime: clockTimeSchema.nullable().optional(),
    devicesOffTime: clockTimeSchema.nullable().optional(),
    prepTemplateId: z.string().uuid().nullable().optional(),
    morningTemplateId: z.string().uuid().nullable().optional(),
    windDownTemplateId: z.string().uuid().nullable().optional(),
    /**
     * UX v1.3 §3.13, §11.2 (TD-25, TD-26) — the after-work list (kind
     * `transition`) and the free-time pool (kind `activity`, structure
     * `pool`); null = none. The kind check is the service's (DAY-5).
     */
    afterWorkTemplateId: z.string().uuid().nullable().optional(),
    activityTemplateId: z.string().uuid().nullable().optional(),
    // v1.3 R52 (DAY-6): several workouts, each once — its block is keyed by it (TD-24).
    training: z
      .array(dayPlanTrainingSchema)
      .max(7)
      .refine((entries) => new Set(entries.map((entry) => entry.habitId)).size === entries.length, {
        message: "Each workout once.",
      })
      .optional(),
    breaks: z.array(dayPlanBreakSchema).max(7).optional(),
    excludedFixtureIds: z.array(z.string().uuid()).max(50).optional(),
    sortOrder: z.number().int().min(0).max(999).optional(),
  })
  .refine((patch) => Object.values(patch).some((value) => value !== undefined), {
    message: "Nothing to update.",
  });

export type DayPlanPatchInput = z.infer<typeof dayPlanPatchSchema>;

export const updateDayPlanInput = z.object({
  id: z.string().uuid(),
  patch: dayPlanPatchSchema,
});

export type UpdateDayPlanInput = z.infer<typeof updateDayPlanInput>;

/** `dayPlan.create` takes nothing the service cannot default (the next name, the first plan's weekdays). */
export const createDayPlanInput = z
  .object({
    name: z.string().trim().min(1).max(DAY_PLAN_NAME_MAX).optional(),
  })
  .optional();

export const dayPlanIdInput = z.object({ id: z.string().uuid() });

/** `dayPlan.complete` — v1.2 §4.13i; `noWork` says the missing work template is deliberate. */
export const completeDayPlanInput = z.object({
  id: z.string().uuid(),
  noWork: z.boolean().optional(),
});

export type CompleteDayPlanInput = z.infer<typeof completeDayPlanInput>;

export const listDayPlansInput = z
  .object({ state: dayPlanStateSchema.optional() })
  .optional();
