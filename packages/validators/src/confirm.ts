import { z } from "zod";

import { DURATION_MAX, DURATION_MIN } from "@syn/constants";

import { dayShapeSchema, trainingPlacementSchema } from "./block";
import { dateKeySchema } from "./keys";

/**
 * *Set the day* — UX v1.1 §5.3, what the quick-pick sends (DYN-5).
 *
 * EVERY SECTION IS OPTIONAL because every section is already answered with
 * today's default; a morning where nothing is different is `{ date }`. The
 * service fills what the pick did not send from the plan — the week's
 * assignment, the default alternate, the typical workout, the last placement
 * — so the one-tap morning and the four-tap morning write the same row.
 *
 * NO CLAMP (R21). A menu duration is what the person set at the pick; the
 * budget line is the feedback, never a refusal (R7). The only refusal the
 * service makes is an unplaced workout that is not *not today* (§3.7), and
 * that is a rule about the day, not about this shape.
 */

const menuDuration = z.number().int().min(DURATION_MIN).max(DURATION_MAX);

export const confirmDayInput = z.object({
  date: dateKeySchema,
  /** Explicit shape; `workingToday: false` is the *sometimes* day's shortcut. */
  shape: dayShapeSchema.optional(),
  workingToday: z.boolean().optional(),
  routine: z
    .object({
      /** `variants` mode — the routine chosen today. */
      variantTemplateId: z.string().uuid().optional(),
      /** `daily_menu` mode — the ticked habits, in the order they were ticked. */
      menuHabitIds: z.array(z.string().uuid()).max(100).optional(),
      /** Per-habit lengths after *Shorten to fit*; absent = the range midpoint. */
      menuDurations: z.record(z.string().uuid(), menuDuration).optional(),
    })
    .optional(),
  /** One choice per *one of* group on the day's blocks. */
  alternates: z
    .array(
      z.object({
        groupId: z.string().min(1).max(64),
        chosenSlotId: z.string().uuid(),
      }),
    )
    .max(50)
    .optional(),
  training: z
    .object({
      workoutHabitId: z.string().uuid().nullable(),
      placement: trainingPlacementSchema.nullable(),
      notToday: z.boolean().default(false),
      /** R25 — the swap's trade: the other day takes today's typical workout. */
      tradeWithDate: dateKeySchema.optional(),
    })
    .optional(),
  focusHabitId: z.string().uuid().nullable().optional(),
  /** Under *depends on the day* — the pick's answer; ignored otherwise. */
  anchorIsHard: z.boolean().optional(),
  /** §7.3 — yesterday's after-devices-off items the person ticked. */
  lastNight: z
    .object({ doneItemIds: z.array(z.string().uuid()).max(100) })
    .optional(),
  /**
   * UX v1.3 §5.3, TD-26 (DAY-12): the pick's *Free time* under *Build each
   * morning* — the pool members the person tapped, or *Decide later*
   * (the default), which leaves the evening pooled. Never inferred.
   */
  freeTime: z
    .union([z.literal("later"), z.object({ habitIds: z.array(z.string().uuid()).max(50) })])
    .optional(),
});

export type ConfirmDayInput = z.infer<typeof confirmDayInput>;

export const quickPickInput = z.object({ date: dateKeySchema });
