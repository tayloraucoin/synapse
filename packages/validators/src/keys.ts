import { z } from "zod";

/**
 * The two URL keys the routes use. They live here rather than inline in the
 * app because the API validates the same strings: a day fetched by
 * `/day/2026-09-04` and a day fetched by a tRPC procedure must agree on what a
 * day key is, or one of them 404s where the other returns rows.
 */

/**
 * A calendar day key, `YYYY-MM-DD` — cross-cutting §4.1's `/day/{date}`.
 *
 * The regex constrains the shape and the `refine` constrains reality, because
 * `2026-02-30` and `2026-13-40` both match a shape check. Parsing with `Date`
 * and comparing back is what rejects them.
 */
export const dateKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date like 2026-09-04.")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return false;
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }, "That date doesn't exist.");

export type DateKey = z.infer<typeof dateKeySchema>;

/**
 * An ISO week key, `YYYY-Www` — cross-cutting §4.1's `/review/week/{week}`.
 *
 * ISO 8601 allows weeks 01–53; a year has 53 only when it starts on a Thursday
 * (or is a leap year starting on a Wednesday), which is why 53 is accepted by
 * shape and left to the caller. 54 and 00 are not weeks in any year.
 */
export const weekKeySchema = z
  .string()
  .regex(
    /^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/,
    "Use a week like 2026-W36.",
  );

export type WeekKey = z.infer<typeof weekKeySchema>;
