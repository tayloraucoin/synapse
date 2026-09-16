import { z } from "zod";

import { DURATION_MAX, DURATION_MIN, FIXTURE_TITLE_MAX } from "@syn/constants";

import { fixtureKindSchema } from "./block";
import { iconValueSchema } from "./icon";
import { clockTimeSchema } from "./preferences";
import { schedulingSchema, weekdaySchema } from "./template";

/**
 * A fixture — something that happens every week on set days at a set time
 * (UX v1.1 §3.6, §4.4, §11.6). The first-run sheet and Settings share this.
 *
 * `blockKind` is the two the sheet offers — *In work · In the evening*; the
 * column accepts any kind, the form offers two (v1.1 §4.4).
 */
export const fixtureFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .trim()
    .min(1, "Give it a title.")
    .max(FIXTURE_TITLE_MAX, "Give it a title."),
  /** Mon = 0 … Sun = 6; a Mon/Wed/Fri class is one fixture. */
  weekdays: z
    .array(weekdaySchema)
    // [COPY — needs Vesper sign-off: v1.1 §4.4 states the field, not the sentence.]
    .min(1, "Pick at least one day.")
    .max(7),
  atClock: clockTimeSchema,
  durationMin: z.number().int().min(DURATION_MIN).max(DURATION_MAX),
  /** Omitted = the kind's default block (`FIXTURE_KINDS`, UX v1.2 R42); the sheet may override. */
  blockKind: z.enum(["work", "activity"]).optional(),
  scheduling: schedulingSchema.default("hard"),
  habitId: z.string().uuid().nullable().optional(),
  /**
   * UX v1.2 §3.6, R42 — a label and a glyph. The kind's default glyph and
   * default block are `FIXTURE_KINDS`'; the service fills `icon` from the
   * kind when the sheet sends none, and `blockKind` is the sheet's to
   * override.
   */
  kind: fixtureKindSchema.default("other"),
  icon: iconValueSchema.optional(),
});

export type FixtureFormInput = z.infer<typeof fixtureFormSchema>;

export const fixtureIdInput = z.object({ id: z.string().uuid() });

export const listFixturesInput = z
  .object({ includeArchived: z.boolean().optional() })
  .optional();
