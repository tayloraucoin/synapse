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

/**
 * When the day closes — 00:00 to 06:00, working default 03:00 (Epic 1 §13.1).
 *
 * THE BOUND IS THE PRODUCT'S DEFINITION OF A DAY, not a UI convenience. A
 * close at 14:00 would make "today" a thing that ends in the afternoon, and
 * every day boundary, every review window and every carried item would follow
 * it. Enforced here as well as by the field's `min`/`max`, because the field
 * is a suggestion to a browser and this is the rule.
 *
 * `[PROVISIONAL — Taylor]` per the ticket: the bound and default are built as
 * §13.1 states them, pending a one-line confirmation.
 *
 * `[COPY — needs Vesper sign-off]` on the message: §9 gives the bound but no
 * sentence for breaking it.
 */
export const dayCloseTimeSchema = clockTimeSchema.refine(
  (value) => value >= "00:00" && value <= "06:00",
  { message: "Pick a time between midnight and 6:00." },
);
