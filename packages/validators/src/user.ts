import { z } from "zod";

import { DISPLAY_NAME_MAX } from "@syn/constants";

import { clockTimeSchema, themePreferenceSchema, timezoneSchema } from "./preferences";

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
  })
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    { message: "Nothing to update." },
  );

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesInput>;
