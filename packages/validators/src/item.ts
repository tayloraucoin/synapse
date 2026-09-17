import { z } from "zod";

import {
  INTENTION_MAX,
  MORNING_GRATITUDE_MAX,
  NOTE_MAX,
  REFLECTION_AXIS_MAX,
  VISUALISATION_MAX,
} from "@syn/constants";

import { dateKeySchema } from "./keys";

/** LS-01's two writes, and IT-01's five. */

export const itemIdInput = z.object({ id: z.string().uuid() });

/**
 * Mark done, or undo.
 *
 * `at` IS SENT BY THE CLIENT, which is unusual and deliberate: it is the
 * instant the checkbox was tapped, not the instant the request arrived. A slow
 * network must not move when something happened, and on undo this carries the
 * ORIGINAL `done_at` back so restoring a record does not rewrite it.
 *
 * It is coerced rather than parsed as a string because superjson already gives
 * the resolver a `Date`; the coercion is what makes the schema honest about
 * both call sites, the HTTP one and the server caller.
 */
export const setDoneInput = z.object({
  id: z.string().uuid(),
  done: z.boolean(),
  at: z.coerce.date(),
});

export type SetDoneInput = z.infer<typeof setDoneInput>;

/** *Not today* / *Back in the list*. No reason is asked (Epic 2 §4). */
export const deferItemInput = z.object({
  id: z.string().uuid(),
  deferred: z.boolean(),
});

/**
 * The quantity tail. Null clears it — a person who typed a number and then
 * emptied the field meant to remove it, not to store zero.
 */
export const setQuantityInput = z.object({
  id: z.string().uuid(),
  value: z.number().nonnegative().max(100_000).nullable(),
});

export const setNoteInput = z.object({
  id: z.string().uuid(),
  note: z.string().max(NOTE_MAX).nullable(),
});

/** One reflection axis, 1–7 — the same scale as importance (§6.6). */
export const rateItemInput = z.object({
  id: z.string().uuid(),
  axis: z.string().min(1).max(REFLECTION_AXIS_MAX),
  value: z.number().int().min(1).max(7).nullable(),
});

/**
 * DH-02. `wokeAt` null is *Clear*, which returns the day to its planned
 * anchor rather than to nothing.
 */
/** The orient frame's read (v1.1 §5.2) — today unless a date is given. */
export const orientInput = z.object({ date: dateKeySchema.optional() }).optional();

/**
 * The frame's optional lines, autosaved (v1.1 §5.2; the third since UX v1.2
 * §5.2). Empty clears. `andSetDay` is *Set from the plan* (v1.2 R37): the
 * tap on *Start the morning* sets the day in the same call; `workingToday`
 * and `anchorIsHard` are the frame's dialog answers, never inferred.
 */
export const saveMorningInput = z
  .object({
    date: dateKeySchema,
    gratitude: z.string().trim().max(MORNING_GRATITUDE_MAX).nullable().optional(),
    intention: z.string().trim().max(INTENTION_MAX).nullable().optional(),
    visualisation: z.string().trim().max(VISUALISATION_MAX).nullable().optional(),
    andSetDay: z.boolean().optional(),
    workingToday: z.boolean().optional(),
    anchorIsHard: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.gratitude !== undefined ||
      value.intention !== undefined ||
      value.visualisation !== undefined ||
      value.andSetDay === true,
    { message: "Nothing to save." },
  );

export type SaveMorningInput = z.infer<typeof saveMorningInput>;

export const setWakeTimeInput = z.object({
  date: dateKeySchema,
  wokeAt: z.coerce.date().nullable(),
  /** UX v1.1 R11 — the orient frame stamps `orient`; the picker, `manual`. */
  source: z.enum(["manual", "orient"]).default("manual"),
});
