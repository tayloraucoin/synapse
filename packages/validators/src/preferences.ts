import { z } from "zod";

/**
 * Account preferences — official spec §3.1, Epic 1 ST-08/ST-09.
 *
 * The theme values are next-themes' own (`system` is a real stored choice, not
 * an absence), so the Appearance control and the persisted value are the same
 * three words.
 */

export const themePreferenceSchema = z.enum(["system", "light", "dark"]);

export type ThemePreference = z.infer<typeof themePreferenceSchema>;

/**
 * An IANA zone name. Validated against the runtime's own zone table where the
 * host exposes one (`Intl.supportedValuesOf` — Node 22 and every target
 * browser); where it does not, the shape check stands alone rather than the
 * schema inventing a list it would then have to maintain.
 */
export const timezoneSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) => {
      const supported = Intl.supportedValuesOf;
      if (typeof supported !== "function") {
        return /^[A-Za-z_+-]+\/[A-Za-z_0-9+-]+(\/[A-Za-z_0-9+-]+)?$|^UTC$/.test(
          value,
        );
      }
      return supported("timeZone").includes(value);
    },
    { message: "That isn't a time zone Synapse recognises." },
  );

export type Timezone = z.infer<typeof timezoneSchema>;

/**
 * A wall-clock time of day, `HH:mm`, 24-hour. Used by `day_close_time`,
 * `review_reminder_time`, the week-build reminder, and a template's anchor.
 */
export const clockTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a time like 07:00.");

export type ClockTime = z.infer<typeof clockTimeSchema>;
