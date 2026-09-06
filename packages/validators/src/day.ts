import { z } from "zod";

import { dateKeySchema } from "./keys";

/**
 * `day.get`'s input.
 *
 * The far bound exists so a mistyped or crafted key cannot ask the server to
 * build a day a thousand years out — every `Intl` call in the read model would
 * run, and the answer would be an empty day nobody wanted. A year ahead covers
 * every real plan; further is a bug or a probe.
 */
export const getDayInput = z.object({
  date: dateKeySchema,
  /** SYS-2 passes the device zone so the header can label the day's own. */
  deviceZone: z.string().max(64).optional(),
});

export type GetDayInput = z.infer<typeof getDayInput>;
