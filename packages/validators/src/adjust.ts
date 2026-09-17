import { z } from "zod";

import { DURATION_MAX, DURATION_MIN, PRIORITY_MAX, PRIORITY_MIN } from "@syn/constants";

import { blockKindSchema } from "./block";
import { versionKeySchema } from "./habit";
import { dateKeySchema } from "./keys";
import { clockTimeSchema } from "./preferences";

/**
 * Adjust, *Do now*, *Edit today's*, and the Schedule's drags — UX v1.1 §6.3–6.6
 * (DYN-6). Every one is a single day, a single intent, and none but Adjust
 * carries a reason (R8).
 *
 * NO CLAMP (R21). *Takes* on the habit-day sheet is bounded by what a day can
 * hold (1–480), never by the habit's range; the range is muted text.
 */

export const adjustEntrySchema = z.enum(["late-offer", "header", "one-off", "band-drag"]);
export const adjustWhatSchema = z.enum(["slide", "hold"]);
export const adjustHowSchema = z.enum(["shorten", "cut", "choose"]);

export const adjustPreviewInput = z
  .object({
    date: dateKeySchema,
    entry: adjustEntrySchema,
    /** A `reasons.key` from the person's own set; the tier travels with it (§11.9). */
    reasonKey: z.string().min(1).max(64),
    what: adjustWhatSchema,
    how: adjustHowSchema.optional(),
    /** *Choose what stays* — the ticked ids. */
    chosenIds: z.array(z.string().uuid()).max(200).optional(),
    /** *Keep instead* — never shortened or cut. */
    keepInstead: z.array(z.string().uuid()).max(200).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.what === "hold" && value.how === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["how"],
        message: "Say how.",
      });
    }
  });

export type AdjustPreviewInput = z.infer<typeof adjustPreviewInput>;

export const adjustApplyInput = adjustPreviewInput.and(
  z.object({
    /** The preview's `fingerprint`; a changed day is `CONFLICT`, never a surprise. */
    fingerprint: z.string().max(64),
  }),
);

export type AdjustApplyInput = z.infer<typeof adjustApplyInput>;

export const adjustScopeInput = z.object({ date: dateKeySchema });

export const habitDayEditInput = z
  .object({
    itemId: z.string().uuid(),
    /** Today's length. Bounded by the day, not by the range (R21). */
    durationMin: z.number().int().min(DURATION_MIN).max(DURATION_MAX).optional(),
    /**
     * UX v1.2 §3.5, TD-11 — one of the habit's versions by key; its minutes
     * become today's length and `version_key` is written with it. A
     * `durationMin` in the same call wins and clears the key.
     */
    versionKey: versionKeySchema.optional(),
    /** *At*: in the stack, or a clock — which pins it for today. */
    at: z
      .discriminatedUnion("kind", [
        z.object({ kind: z.literal("stack") }),
        z.object({ kind: z.literal("clock"), clock: clockTimeSchema }),
      ])
      .optional(),
    priority: z.number().int().min(PRIORITY_MIN).max(PRIORITY_MAX).optional(),
    /** *Leave out today* — not assigned, the same state as a trim (v1 R1). */
    leaveOut: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.durationMin !== undefined ||
      value.versionKey !== undefined ||
      value.at !== undefined ||
      value.priority !== undefined ||
      value.leaveOut !== undefined,
    { message: "Nothing to change." },
  );

export type HabitDayEditInput = z.infer<typeof habitDayEditInput>;

export const doNowInput = z.object({
  itemId: z.string().uuid(),
  /** *Do now anyway* — the overflow item becomes not assigned today. */
  anyway: z.boolean().optional(),
});

export type DoNowInput = z.infer<typeof doNowInput>;

/** *Add from the library* — the day header sheet's row (v1.1 §6.2, DYN-15). */
export const addFromLibraryInput = z.object({
  date: dateKeySchema,
  habitId: z.string().uuid(),
  /** The block it lands in; null on an unstructured day. */
  blockKind: blockKindSchema.nullable(),
});

export type AddFromLibraryInput = z.infer<typeof addFromLibraryInput>;

export const moveItemInput = z.object({
  itemId: z.string().uuid(),
  /** Minutes from midnight of the day's date; past 1440 is after midnight. */
  toMin: z.number().int().min(0).max(2 * 1440),
  /** The dialog's answer for a pin or a fixture (R22). */
  confirmed: z.boolean().optional(),
});

export type MoveItemInput = z.infer<typeof moveItemInput>;

export const moveBlockInput = z.object({
  blockId: z.string().uuid(),
  deltaMin: z.number().int().min(-1440).max(1440),
  confirmed: z.boolean().optional(),
});

export type MoveBlockInput = z.infer<typeof moveBlockInput>;

/** The quick-pick's *Shorten to fit* and the over-budget dialog (§5.3). */
export const previewFitInput = z.object({
  date: dateKeySchema,
  habitIds: z.array(z.string().uuid()).max(100),
  durations: z.record(z.string().uuid(), z.number().int().min(DURATION_MIN).max(DURATION_MAX)),
  mode: z.enum(["shorten_then_cut", "cut_only"]).default("shorten_then_cut"),
});

export type PreviewFitInput = z.infer<typeof previewFitInput>;
