import { z } from "zod";

import { DISPLAY_NAME_MAX } from "@syn/constants";

import {
  clockTimeSchema,
  dayCloseTimeSchema,
  themePreferenceSchema,
  timezoneSchema,
} from "./preferences";

/**
 * The account preferences a person can change — official spec §3.1, edited on
 * Epic 1's ST-01 (Account), ST-08 (Day & time), and ST-09 (Appearance).
 *
 * Every field is optional because the three screens each write a subset, and a
 * schema per screen would be three places to change a bound. `.partial()` on
 * the object would allow `{}`, which is a no-op write; the refine rejects it,
 * so a mutation that would do nothing fails loudly rather than reporting
 * success.
 */
export const updatePreferencesInput = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, "Add a name — it's just what the app calls you.")
      .max(DISPLAY_NAME_MAX, "Add a name — it's just what the app calls you.")
      .optional(),
    timezone: timezoneSchema.optional(),
    /** The day opens and closes at this time (official spec §6.1). */
    dayCloseTime: clockTimeSchema.optional(),
    /** When the review reminder fires (§8.2 N4). */
    reviewReminderTime: clockTimeSchema.optional(),
    theme: themePreferenceSchema.optional(),
    /** FR-01 and ST-08. The default `anchor_time` for a new template. */
    usualWakeTime: clockTimeSchema.optional(),
    /**
     * Which first-run step to resume at, or null once the sequence is done.
     *
     * It lives here rather than on a `firstRun` router because it is an account
     * scalar and this service already writes account scalars. FR-01…05 write it
     * on every Continue, Skip, back and *Finish later*, so a reload or a second
     * device resumes where the person actually stopped.
     */
    firstRunStep: z.number().int().min(1).max(5).nullable().optional(),
    /**
     * ST-08's two deferred changes (cross-cutting §7.3, §7.5).
     *
     * A day close or a zone that took effect the instant it was saved would
     * move the boundary of the day the person is currently living in — items
     * could jump to yesterday mid-afternoon. These write the pending pair
     * instead, and USE-1's `resolveTodayFor` promotes them at the next
     * boundary. The `_from` date is computed on the server, never sent, so a
     * client cannot ask for a change that applies retroactively.
     */
    pendingDayCloseTime: dayCloseTimeSchema.optional(),
    pendingTimezone: timezoneSchema.optional(),
  })
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    { message: "Nothing to update." },
  );

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesInput>;
