import { z } from "zod";

import {
  DURATION_MAX,
  DURATION_MIN,
  PRIORITY_MAX,
  PRIORITY_MIN,
  TEMPLATE_NAME_MAX,
  TEMPLATE_OFFSET_MIN,
  WEEKLY_TARGET_MAX,
  WEEKLY_TARGET_MIN,
} from "@syn/constants";

import { clockTimeSchema } from "./preferences";

/**
 * TP-02 and TP-03's rules — Epic 1 §5 and §9.
 *
 * TWO SCHEMAS FOR THE NAME, DELIBERATELY. `templatePatchSchema` allows an
 * empty name because the editor creates the row on open and autosaves every
 * keystroke — a draft has to be able to exist before it is named.
 * `templateLeaveSchema` is the one that requires 1–40, and it runs when the
 * person tries to leave, which is the moment the document attaches the rule to
 * ("if empty on back with slots, the field errors *Name this template.*").
 */

export const weekdaySchema = z
  .number()
  .int()
  .min(0)
  .max(6);

export const templatePatchSchema = z.object({
  id: z.string().uuid(),
  patch: z.object({
    /** May be empty while drafting; `templateLeaveSchema` is the real gate. */
    name: z.string().trim().max(TEMPLATE_NAME_MAX).optional(),
    anchorTime: clockTimeSchema.optional(),
    /** Null is *none*, never 0 — official spec §3.4 and SET-1's column. */
    weeklyTarget: z
      .number()
      .int()
      .min(WEEKLY_TARGET_MIN)
      .max(WEEKLY_TARGET_MAX)
      .nullable()
      .optional(),
    typicalDays: z.array(weekdaySchema).max(7).nullable().optional(),
  }),
});

export type TemplatePatchInput = z.infer<typeof templatePatchSchema>;

/** The rule that runs when someone tries to leave a named-nothing draft. */
export const templateLeaveSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name this template.")
    .max(TEMPLATE_NAME_MAX, "Name this template."),
});

export const timeModeSchema = z.enum(["fixed_time", "window", "unscheduled"]);
export const schedulingSchema = z.enum(["hard", "soft"]);

/**
 * One slot.
 *
 * The cross-field rules are the document's, in `superRefine` because each is a
 * relationship rather than a property of one field:
 *
 * - a fixed slot needs a start;
 * - a window needs both ends, in order, and at least as long as the item —
 *   *The window is shorter than the item.* is Epic 1 §9's sentence;
 * - *Anytime* needs neither, and must not be told it does.
 */
export const slotFormSchema = z
  .object({
    templateId: z.string().uuid(),
    slotId: z.string().uuid().optional(),
    habitId: z.string().uuid(),
    timeMode: timeModeSchema,
    offsetStartMin: z.number().int().min(TEMPLATE_OFFSET_MIN).nullable(),
    offsetEndMin: z.number().int().nullable(),
    durationMin: z.number().int().min(DURATION_MIN).max(DURATION_MAX),
    priorityOverride: z
      .number()
      .int()
      .min(PRIORITY_MIN)
      .max(PRIORITY_MAX)
      .nullable(),
    scheduling: schedulingSchema,
    /**
     * The other slot to join at this start. Present only when the person has
     * answered the same-start question with *Yes, multitask*.
     */
    multitaskWith: z.string().uuid().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.timeMode === "fixed_time" && value.offsetStartMin === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["offsetStartMin"],
        message: "Pick a time.",
      });
      return;
    }

    if (value.timeMode !== "window") return;

    if (value.offsetStartMin === null || value.offsetEndMin === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["offsetEndMin"],
        message: "Pick a window.",
      });
      return;
    }

    if (value.offsetEndMin <= value.offsetStartMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["offsetEndMin"],
        // [COPY — needs Vesper sign-off: Epic 1 gives no sentence for a window
        // whose end is before its start. LB-02's "From"/"to" line is a
        // different control and is not borrowed.]
        message: "The window ends before it starts.",
      });
      return;
    }

    if (value.offsetEndMin - value.offsetStartMin < value.durationMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["offsetEndMin"],
        message: "The window is shorter than the item.",
      });
    }
  });

export type SlotFormInput = z.infer<typeof slotFormSchema>;

export const templateIdInput = z.object({ id: z.string().uuid() });

/**
 * TP-02 discards only an UNNAMED slotless draft; FR-03 discards its prefilled
 * *Morning* too, because the sequence typed that name, not the person.
 */
export const discardTemplateInput = z.object({
  id: z.string().uuid(),
  requireUnnamed: z.boolean().optional(),
});
export const slotIdInput = z.object({ id: z.string().uuid() });

export const listTemplatesInput = z
  .object({ includeArchived: z.boolean().optional() })
  .optional();

export const moveSlotInput = z.object({
  id: z.string().uuid(),
  direction: z.enum(["up", "down"]),
});

/** The payload `removeSlot` returns, so *Undo* can put it back exactly. */
export const restoreSlotInput = z.object({
  templateId: z.string().uuid(),
  habitId: z.string().uuid(),
  timeMode: timeModeSchema,
  offsetStartMin: z.number().int().nullable(),
  offsetEndMin: z.number().int().nullable(),
  durationMin: z.number().int(),
  priorityOverride: z.number().int().nullable(),
  scheduling: schedulingSchema,
  multitaskGroup: z.string().nullable(),
  sortOrder: z.number().int(),
});

export type RestoreSlotInput = z.infer<typeof restoreSlotInput>;
