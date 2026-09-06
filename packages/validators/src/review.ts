import { z } from "zod";

import { OTHER_REASON_MAX } from "@syn/constants";

import { dateKeySchema, weekKeySchema } from "./keys";
import { missTierSchema } from "./reason";

/** REV-1's three reads. All read-only in this slice. */

export const reviewDayInput = z.object({ date: dateKeySchema });

export const reviewWeekInput = z.object({ week: weekKeySchema });

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
