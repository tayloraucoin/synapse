import { z } from "zod";

import {
  DURATION_MAX,
  DURATION_MIN,
  GAP_MAX,
  PRIORITY_MAX,
  PRIORITY_MIN,
  TEMPLATE_NAME_MAX,
  WEEKLY_TARGET_MAX,
  WEEKLY_TARGET_MIN,
} from "@syn/constants";

import {
  anchorDirectionSchema,
  blockFlowSchema,
  blockKindSchema,
  blockStructureSchema,
  slotRoleSchema,
  workDayKindSchema,
} from "./block";
import { iconValueSchema } from "./icon";
import { clockTimeSchema } from "./preferences";

/**
 * The block editor's rules — UX v1.1 §3.2, §3.4, §3.5, §3.11, §11.4, §11.5
 * (formerly TP-02 and TP-03, Epic 1 §5 and §9).
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
    /** An explicit override — meaningful for a work template (v1.1 R5). */
    anchorTime: clockTimeSchema.nullable().optional(),
    /** Null is *none*, never 0 — official spec §3.4 and SET-1's column. */
    weeklyTarget: z
      .number()
      .int()
      .min(WEEKLY_TARGET_MIN)
      .max(WEEKLY_TARGET_MAX)
      .nullable()
      .optional(),
    typicalDays: z.array(weekdaySchema).max(7).nullable().optional(),
    kind: blockKindSchema.optional(),
    flow: blockFlowSchema.optional(),
    structure: blockStructureSchema.optional(),

    /*
     * ---- UX v1.2 §3.8, R32, TD-14: a work-day type's four columns. Meaningful
     * only when `kind = work`; the SERVICE refuses them on any other kind (the
     * patch does not know the row's kind). `anchorTime` above is the type's
     * *working by*.
     */
    workEndTime: clockTimeSchema.nullable().optional(),
    locationKind: workDayKindSchema.nullable().optional(),
    anchorDirection: anchorDirectionSchema.nullable().optional(),
    icon: iconValueSchema.nullable().optional(),
  }),
});

export type TemplatePatchInput = z.infer<typeof templatePatchSchema>;

/** The four work columns alone — what `template.create({ kind: "work" })` may also carry. */
export const workDayTypeFieldsSchema = z.object({
  anchorTime: clockTimeSchema.nullable().optional(),
  workEndTime: clockTimeSchema.nullable().optional(),
  locationKind: workDayKindSchema.nullable().optional(),
  anchorDirection: anchorDirectionSchema.nullable().optional(),
  icon: iconValueSchema.nullable().optional(),
});

export type WorkDayTypeFieldsInput = z.infer<typeof workDayTypeFieldsSchema>;

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
 * One slot in a stacked block (UX v1.1 §11.5).
 *
 * A SLOT HAS NO OFFSET — and no time mode. It has a length, the gap before
 * it, and, if it is a pin, a clock time; where it starts is derived by
 * `stackBlock`. Windows and *anytime* are day-level ideas (a one-off can be
 * either); inside a stacked block a slot is always `fixed_time`. Rows written
 * under v1.0 with another mode are read as they are and refused on write
 * (Mason, DYN-4 — logged).
 *
 * The cross-field rules are relationships and live in `superRefine`:
 *
 * - a pin has no gap (the database check refuses it too; this is the sentence);
 * - a slot joins a multitask bracket OR a one-of group at a shared position,
 *   never both.
 */
export const slotFormSchema = z
  .object({
    templateId: z.string().uuid(),
    slotId: z.string().uuid().optional(),
    habitId: z.string().uuid(),
    durationMin: z.number().int().min(DURATION_MIN).max(DURATION_MAX),
    gapBeforeMin: z.number().int().min(0).max(GAP_MAX),
    /** A clock time when the slot is a pin; the stack flows around it (R3). */
    pinnedClock: clockTimeSchema.nullable(),
    role: slotRoleSchema,
    priorityOverride: z
      .number()
      .int()
      .min(PRIORITY_MIN)
      .max(PRIORITY_MAX)
      .nullable(),
    scheduling: schedulingSchema,
    /**
     * The other slot to share a position with. Present only when the person
     * has answered the same-position question — *Yes, multitask* or *No, one
     * or the other* (v1.1 §3.5).
     */
    multitaskWith: z.string().uuid().optional(),
    alternatesWith: z.string().uuid().optional(),
    /** For a one-of member: this is the one the fit arithmetic uses. */
    alternatesDefault: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.pinnedClock !== null && value.gapBeforeMin !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gapBeforeMin"],
        // [COPY — needs Vesper sign-off: v1.1 §3.2 states the rule, not a sentence.]
        message: "Pinned things have no gap before them.",
      });
    }

    if (value.multitaskWith !== undefined && value.alternatesWith !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["alternatesWith"],
        // [COPY — needs Vesper sign-off]
        message: "A thing is either a multitask or one of two, not both.",
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
  .object({
    includeArchived: z.boolean().optional(),
    /** Only this block kind — the editor's list for one kind (v1.1 §4.14). */
    kind: blockKindSchema.optional(),
  })
  .optional();

export const moveSlotInput = z.object({
  id: z.string().uuid(),
  direction: z.enum(["up", "down"]),
  /** A drag to a position is the adjacent swap repeated (v1.1 §3.11, DYN-9). */
  steps: z.number().int().min(1).max(50).optional(),
});

/**
 * The payload `removeSlot` returns, so *Undo* can put it back exactly — the
 * stacked shape included (v1.1 §11.5). `sortOrder` is the position it had;
 * the service re-densifies around it.
 */
export const restoreSlotInput = z.object({
  templateId: z.string().uuid(),
  habitId: z.string().uuid(),
  /** Kept for legacy rows; a restored slot is otherwise `fixed_time`. */
  timeMode: timeModeSchema,
  durationMin: z.number().int(),
  gapBeforeMin: z.number().int(),
  pinnedAt: clockTimeSchema.nullable(),
  role: slotRoleSchema,
  priorityOverride: z.number().int().nullable(),
  scheduling: schedulingSchema,
  multitaskGroup: z.string().nullable(),
  alternatesGroup: z.string().nullable(),
  alternatesDefault: z.boolean(),
  sortOrder: z.number().int(),
});

export type RestoreSlotInput = z.infer<typeof restoreSlotInput>;
