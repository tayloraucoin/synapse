import { z } from "zod";

import { dateKeySchema, weekKeySchema } from "./keys";

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
