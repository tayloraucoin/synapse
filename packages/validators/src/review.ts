import { z } from "zod";

import { OTHER_REASON_MAX } from "@syn/constants";

import { dateKeySchema, weekKeySchema } from "./keys";
import { missTierSchema } from "./reason";

/** REV-1's three reads. All read-only in this slice. */

export const reviewDayInput = z.object({ date: dateKeySchema });

export const reviewWeekInput = z.object({ week: weekKeySchema });

/** Confirm yesterday from the review — the ticked ids (v1.1 §7.3, DYN-18). */
export const confirmLastNightInput = z.object({
  date: dateKeySchema,
  doneItemIds: z.array(z.string().uuid()).max(100),
});

export type ConfirmLastNightInput = z.infer<typeof confirmLastNightInput>;

/**
 * History, paginated by WEEK.
 *
 * `before` is a day key rather than an offset so a page cannot shift under
 * someone who reviews a day while scrolling — an offset would repeat or skip a
 * week the moment the underlying set changed.
 */
export const reviewHistoryInput = z.object({
  before: dateKeySchema.optional(),
  limit: z.number().int().min(1).max(26).optional(),
});

/**
 * One decision — a discriminated union matching the UI's `Decision`.
 *
 * *OTHER* WITH NO TEXT IS REFUSED, with the document's own sentence. It is the
 * one place a decision can be incomplete: every other choice is a tap, and
 * *Other* asks for words. Refusing here as well as in the panel means a
 * malformed client cannot write a miss whose reason nobody can read.
 */
export const decisionInput = z
  .discriminatedUnion("kind", [
    z.object({ kind: z.literal("carry") }),
    z.object({
      kind: z.literal("missed"),
      tier: missTierSchema,
      reasonKey: z.string().min(1).max(64).nullable(),
      reasonText: z.string().trim().max(OTHER_REASON_MAX).nullable(),
      tradedUpItemId: z.string().uuid().nullable(),
    }),
  ])
  // The refinement sits on the UNION, not on a member: a discriminated union
  // takes plain objects, and a member wrapped in `superRefine` is a
  // `ZodEffects` it will not accept.
  .superRefine((value, ctx) => {
    if (value.kind !== "missed") return;

    const hasKey = value.reasonKey !== null && value.reasonKey !== "";
    const hasText = value.reasonText !== null && value.reasonText.trim() !== "";
    if (!hasKey && !hasText) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reasonText"],
        message: "Say what it was, in a few words.",
      });
    }
  });

export const decideInput = z.object({
  itemId: z.string().uuid(),
  decision: decisionInput,
});

export type DecideInput = z.infer<typeof decideInput>;

/**
 * Edit mode's batch — REV-3.
 *
 * IT REUSES `decideInput`, deliberately: a change made in edit mode is the same
 * decision as one made live, and a second schema would be a second place the
 * traded-up rule or the reason refinement could drift. The batch is capped
 * because it is one transaction, and a day cannot honestly have more decisions
 * than it has items.
 *
 * An empty array is allowed. *Save changes* is disabled until the batch is
 * dirty, so an empty one means a change was made and then reversed — which is
 * still a person pressing Save, and still an edit worth stamping.
 */
export const saveChangesInput = z.object({
  date: dateKeySchema,
  changes: z.array(decideInput).max(200),
});

export type SaveChangesInput = z.infer<typeof saveChangesInput>;

/** WR-02 — one habit inside one week. */
export const habitWeekInput = z.object({
  week: weekKeySchema,
  habitId: z.string().uuid(),
});

export type HabitWeekInput = z.infer<typeof habitWeekInput>;
