import { z } from "zod";

import { CAPACITY_MAX, CAPACITY_MIN } from "@syn/constants";

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

/**
 * TR-01's input — official spec §5.8.
 *
 * `keep` IS THE PERSON OVERRIDING THE ORDER. The trim offers the least
 * important things first (§6.6); *Keep instead* says "not that one", and the
 * next-lowest goes instead. The set is sent rather than the resulting trim
 * list, so the server computes the same answer from the same rule rather than
 * being told which rows to set aside.
 */
export const applyTrimInput = z.object({
  date: dateKeySchema,
  capacityMin: z
    .number()
    .int()
    .min(CAPACITY_MIN, `Between ${CAPACITY_MIN} and ${CAPACITY_MAX} minutes.`)
    .max(CAPACITY_MAX, `Between ${CAPACITY_MIN} and ${CAPACITY_MAX} minutes.`),
  keep: z.array(z.string().uuid()).max(200),
});

export type ApplyTrimInput = z.infer<typeof applyTrimInput>;

/**
 * *Working today* — UX v1.2 §3.9, R40, TD-19 (RUN-6). One of the person's
 * work-day types onto a day that has none; the reverse takes the date alone.
 */
export const applyWorkTypeInput = z.object({
  date: dateKeySchema,
  templateId: z.string().uuid(),
});

export type ApplyWorkTypeInput = z.infer<typeof applyWorkTypeInput>;

export const removeWorkTypeInput = z.object({ date: dateKeySchema });

export type RemoveWorkTypeInput = z.infer<typeof removeWorkTypeInput>;
