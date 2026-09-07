import { z } from "zod";

import { OTHER_REASON_MAX, SHIFT_MAX, SHIFT_MIN } from "@syn/constants";

import { dateKeySchema } from "./keys";
import { missTierSchema } from "./reason";

/**
 * SF-01's inputs — Epic 2 §6, official spec §5.6.
 *
 * THE AMOUNT IS BOUNDED AND STEPPED. Five minutes is below the noise floor of a
 * day's plan and ten hours is not a shift, it is tomorrow; the step of five
 * keeps the resulting times readable, which matters because every moved item's
 * new time is a time a person will read off a screen.
 */
export const shiftAmountSchema = z
  .number()
  .int()
  .min(SHIFT_MIN, `Between ${SHIFT_MIN} and ${SHIFT_MAX} minutes.`)
  .max(SHIFT_MAX, `Between ${SHIFT_MIN} and ${SHIFT_MAX} minutes.`)
  .refine((value) => value % 5 === 0, {
    message: `Between ${SHIFT_MIN} and ${SHIFT_MAX} minutes.`,
  });

/**
 * A shift's reason — REQUIRED, and inherited by everything it cuts (§6.5).
 *
 * This is the whole reason the reason is mandatory: a cut item's `misses` row
 * takes this tier, and the resolver scores by tier (§0.3 R1). A shift with no
 * reason would be a set of misses with no attribution — the one thing the
 * review is built to prevent.
 *
 * A KEY OR A TEXT, NEVER NEITHER. *Other* supplies text and its own tier; a
 * chosen reason supplies a key and the tier it belongs to.
 */
export const shiftReasonSchema = z
  .object({
    reasonKey: z.string().min(1).max(64).nullable(),
    reasonText: z.string().trim().max(OTHER_REASON_MAX).nullable(),
    tier: missTierSchema,
  })
  .refine(
    (value) =>
      (value.reasonKey !== null && value.reasonKey !== "") ||
      (value.reasonText !== null && value.reasonText.trim() !== ""),
    { path: ["reasonText"], message: "Say what it was, in a few words." },
  );

export const shiftPreviewInput = z.object({
  date: dateKeySchema,
  deltaMin: shiftAmountSchema,
});

export type ShiftPreviewInput = z.infer<typeof shiftPreviewInput>;

export const shiftApplyInput = z.object({
  date: dateKeySchema,
  deltaMin: shiftAmountSchema,
  reason: shiftReasonSchema,
  /** The items to cut. Everything else that overflows simply runs long. */
  cut: z.array(z.string().uuid()).max(200),
});

export type ShiftApplyInput = z.infer<typeof shiftApplyInput>;

export const shiftIdInput = z.object({ shiftId: z.string().uuid() });

export type ShiftIdInput = z.infer<typeof shiftIdInput>;
