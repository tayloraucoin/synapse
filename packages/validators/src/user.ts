import { z } from "zod";

import { DISPLAY_NAME_MAX, ORIENT_PASSAGE_MAX } from "@syn/constants";

import {
  anchorDirectionSchema,
  blockOrderSchema,
  morningModeSchema,
  overflowModeSchema,
  scheduleShapeSchema,
  workDaysSchema,
} from "./block";
import { journalPromptsSchema } from "./journal";
import {
  clockTimeSchema,
  dayCloseTimeSchema,
  themePreferenceSchema,
  timezoneSchema,
} from "./preferences";

/** `HH:mm` compared as strings; both are already normalised by `clockTimeSchema`. */
function clockLte(a: string, b: string): boolean {
  return a <= b;
}

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
     * scalar and this service already writes account scalars. The screens
     * write it on every Continue, Skip, back and *Finish later*, so a reload or
     * a second device resumes where the person actually stopped. Twelve under
     * UX v1.1 §4 (DYN-10).
     */
    /** 1–14 under UX v1.2 §4 (RUN-8). */
    firstRunStep: z.number().int().min(1).max(14).nullable().optional(),
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
    /** ST-07's N6 value — Monday = 0, matching the product's weekday index. */
    weekBuildReminderWeekday: z.number().int().min(0).max(6).optional(),
    weekBuildReminderTime: clockTimeSchema.optional(),
    /**
     * When the in-context reminder ask was answered — SET-9's whole rule.
     *
     * It records that a person ANSWERED, not what they said: *Not now* and
     * *Turn on reminders* both set it, because the product's promise is that
     * it asks once. Whether reminders are actually on is a device question the
     * OS owns, and this must never be re-derived from it.
     */
    reminderPromptAnsweredAt: z.coerce.date().optional(),

    /*
     * ---- UX v1.1 §11.2 — the profile the block model lays days out from.
     * Written by first run (§4.1–§4.11) and Settings → Your day (§4.14).
     */
    scheduleShape: scheduleShapeSchema.nullable().optional(),
    workDays: workDaysSchema.nullable().optional(),
    workStartTime: clockTimeSchema.nullable().optional(),
    workEndTime: clockTimeSchema.nullable().optional(),
    anchorDirection: anchorDirectionSchema.nullable().optional(),
    /** @deprecated UX v1.2 R39 — accepted and IGNORED by the service; removed with its sender in RUN-8; dropped in `0008`. */
    earliestWakeTime: clockTimeSchema.nullable().optional(),
    lightsOutTime: clockTimeSchema.nullable().optional(),
    devicesOffTime: clockTimeSchema.nullable().optional(),
    overflowMode: overflowModeSchema.optional(),
    /** @deprecated UX v1.2 R36 — accepted and IGNORED; `passages` is the home (RUN-4); removed with its sender in RUN-9. */
    orientPassage: z
      .string()
      .trim()
      .max(ORIENT_PASSAGE_MAX)
      .nullable()
      .transform((value) => (value === "" ? null : value))
      .optional(),
    /** @deprecated UX v1.2 R41 — accepted and IGNORED; removed with its sender in RUN-9. */
    orientShowLastNight: z.boolean().optional(),
    orientAskGratitude: z.boolean().optional(),
    journalEnabled: z.boolean().optional(),
    journalPrompts: journalPromptsSchema.optional(),
    blockOrder: blockOrderSchema.optional(),

    /*
     * ---- UX v1.2 §11.1 (RUN-1). Written from RUN-3 onward; the columns arrive
     * with `0007`. `earliestWakeTime`, `orientPassage` and `orientShowLastNight`
     * above are removed from this input in RUN-3 and dropped in `0008`.
     */
    /** R37, TD-17 — how mornings go. */
    morningMode: morningModeSchema.optional(),
    /** §3.12 — a quote from the bank joins the passage cycle. Off by default. */
    quotesOptIn: z.boolean().optional(),
    orientAskIntention: z.boolean().optional(),
    orientAskVisualisation: z.boolean().optional(),
    /** §9 N2, R38 — the journal reminder; the time is derived (phone away − 60) while null. */
    journalReminderEnabled: z.boolean().optional(),
    journalReminderTime: clockTimeSchema.nullable().optional(),
  })
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    { message: "Nothing to update." },
  )
  .refine(
    (value) =>
      !value.devicesOffTime ||
      !value.lightsOutTime ||
      // Phone away is before lights out, allowing a wrap past midnight
      // (lights out 00:30, phone away 23:45): the pair is ordered unless
      // both sit on the same side of midnight and the phone comes second.
      clockLte(value.devicesOffTime, value.lightsOutTime) ||
      value.lightsOutTime < "06:00",
    {
      // [COPY — needs Vesper sign-off: v1.1 §4.10 names the rule, not a sentence.]
      message: "Phone away comes before lights out.",
      path: ["devicesOffTime"],
    },
  )
  .refine(
    (value) =>
      !value.earliestWakeTime ||
      !value.usualWakeTime ||
      clockLte(value.earliestWakeTime, value.usualWakeTime),
    {
      // [COPY — needs Vesper sign-off: v1.1 §4.5 names the range, not a sentence.]
      message: "Earliest comes before usual.",
      path: ["earliestWakeTime"],
    },
  );

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesInput>;

/**
 * *Open today* / *Plan this week first* (v1.1 §4.12): the overflow mode rides
 * in the completing write when the fit screen asked the question; absent
 * when it fit and the screen showed no rows.
 */
export const completeFirstRunInput = z
  .object({
    /** @deprecated UX v1.2 §3.10 — accepted and IGNORED; the mode is a Settings preference now. Removed with `step-12-fit` in RUN-13. */
    overflowMode: overflowModeSchema.optional(),
    /** UX v1.2 R37, §4.14 — how mornings go; optional until RUN-13 moves completion to screen 14 (default `set_from_plan`). */
    morningMode: morningModeSchema.optional(),
  })
  .optional();

export type CompleteFirstRunInput = z.infer<typeof completeFirstRunInput>;
