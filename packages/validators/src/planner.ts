import { z } from "zod";
import {
  BLOCK_FILLS,
  BLOCK_KIND_VALUES,
  EVENT_TAGS,
  MEAL_LINK_KINDS,
  NEW_BLOCK_KINDS,
  SLOT_EVENT_KINDS,
  WORK_TIERS,
} from "@syn/constants";
import { colourValueSchema, iconValueSchema } from "./icon";
import { dateKeySchema } from "./keys";
import { clockTimeSchema } from "./preferences";
import { weekdaySchema } from "./template";

/**
 * The planner's records and writes (USE-3): one Zod shape per `0012_use_daily`
 * table, as a router returns its row, and beside each the inputs that write
 * it. Routers, forms, fixtures and data hooks all take their types from here.
 *
 * Every enum reads USE-2's list in `@syn/constants`; no value is retyped.
 * Every CHECK and per-row rule `0012` enforces is refused here too, so a form
 * says it in words before the database says it in an error.
 *
 * RECORDS STRIP UNKNOWN KEYS (zod's default) and never pass them through: a
 * renamed column shows up as a missing required key, not a silent extra.
 * Records carry no refinements, so a caller can `.extend()` or `.pick()` them;
 * the rules live on the inputs, where the writes arrive.
 */

/*
 * ---- Shared parts (to-dos and Work use them too) ----
 */

/** D-USE-34's words for a block, transition or event with no name. */
export const NAME_NEEDED = "Name needed";

/** A name: the New block sheet's and Add event's "Name needed" when empty. */
export const plannerNameSchema = z
  .string({ required_error: NAME_NEEDED })
  .trim()
  .min(1, NAME_NEEDED)
  .max(120);

/** A start: `HH:MM`, 00:00 to 23:59; seconds from Postgres are dropped. */
export const startTimeSchema = clockTimeSchema;

/**
 * An end: a start, or `24:00`, so a block runs to midnight and never crosses
 * it. `24:00` is never a start. Plain `HH:MM` strings order correctly, so
 * `ends > starts` is a string comparison.
 */
export const endTimeSchema = z.union([
  clockTimeSchema,
  z
    .string()
    .trim()
    .regex(/^24:00(:00)?$/, "Use a time like 07:00.")
    .transform(() => "24:00"),
]);

/** An instant as an ISO string: `timestamptz` as a router sends it. */
export const instantSchema = z.string().datetime({ offset: true });

/** A length in minutes: `> 0` (0012's `*_length_min_check`), a day at most. */
export const lengthMinutesSchema = z.number().int().positive().max(1440);

/** A `smallint` order within its parent. */
export const sortOrderSchema = z.number().int().min(0).max(32767);

/** The parts every record shares. */
const rowStamps = {
  id: z.string().uuid(),
  createdAt: instantSchema,
  updatedAt: instantSchema,
};

const RRULE_PARTS = new Set([
  "FREQ",
  "UNTIL",
  "COUNT",
  "INTERVAL",
  "BYSECOND",
  "BYMINUTE",
  "BYHOUR",
  "BYDAY",
  "BYMONTHDAY",
  "BYYEARDAY",
  "BYWEEKNO",
  "BYMONTH",
  "BYSETPOS",
  "WKST",
]);

/**
 * One RFC 5545 rule (D-USE-80), stored as two lines: `DTSTART;VALUE=DATE:`
 * then `RRULE:` (the start anchors INTERVAL and COUNT; decided with USE-6).
 *
 * SHAPE ONLY: both lines, one `FREQ=` of the four Google offers, and only
 * known parts, each once. USE-6's expander rejects what it cannot run.
 */
export const rruleSchema = z
  .string()
  .trim()
  .refine((value) => {
    const lines = value.split(/\r?\n/);
    if (lines.length !== 2) return false;
    const [start, rule] = lines as [string, string];
    if (!/^DTSTART;VALUE=DATE:\d{8}$/.test(start)) return false;
    if (!rule.startsWith("RRULE:")) return false;
    const seen = new Set<string>();
    for (const part of rule.slice("RRULE:".length).split(";")) {
      const match = /^([A-Z]+)=([A-Z0-9,+\-:]+)$/.exec(part);
      if (!match) return false;
      const key = match[1] as string;
      if (!RRULE_PARTS.has(key) || seen.has(key)) return false;
      seen.add(key);
      if (
        key === "FREQ" &&
        !/^(DAILY|WEEKLY|MONTHLY|YEARLY)$/.test(match[2] as string)
      ) {
        return false;
      }
    }
    return seen.has("FREQ");
  }, "Use a repeat rule: DTSTART;VALUE=DATE then RRULE:FREQ=…");

export const blockKindValueSchema = z.enum(BLOCK_KIND_VALUES);
/** What a new block may be: the New block sheet's seven (D-USE-34). */
export const newBlockKindSchema = z.enum(NEW_BLOCK_KINDS);
export const blockFillSchema = z.enum(BLOCK_FILLS);
export const workTierSchema = z.enum(WORK_TIERS);
export const slotEventKindSchema = z.enum(SLOT_EVENT_KINDS);
export const mealLinkKindSchema = z.enum(MEAL_LINK_KINDS);
/** Add event's Work or Personal (D-USE-42); `0013`'s `event_tag`. */
export const eventTagSchema = z.enum(EVENT_TAGS);

/*
 * ---- Rules 0012 enforces, as refinements ----
 */

type Repeat = { rrule?: string | null; onDate?: string | null };
type Span = { startsAt?: string | null; endsAt?: string | null };

/** `blocks_rrule_or_on_date_check`: exactly one of the two. */
function refineOneRepeat(value: Repeat, ctx: z.RefinementCtx) {
  const set = [value.rrule, value.onDate].filter((part) => part != null);
  if (set.length !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["rrule"],
      message: "Choose a repeat rule or one date.",
    });
  }
}

/** `*_ends_after_starts_check`, when both times are present. */
function refineEndsAfterStarts(value: Span, ctx: z.RefinementCtx) {
  if (
    value.startsAt != null &&
    value.endsAt != null &&
    value.endsAt <= value.startsAt
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endsAt"],
      message: "Ends after it starts.",
    });
  }
}

/*
 * ---- Blocks ----
 */

export const blockRecord = z.object({
  ...rowStamps,
  kind: blockKindValueSchema,
  name: z.string(),
  icon: iconValueSchema.nullable(),
  color: colourValueSchema.nullable(),
  startsAt: startTimeSchema,
  endsAt: endTimeSchema,
  rrule: rruleSchema.nullable(),
  onDate: dateKeySchema.nullable(),
  fill: blockFillSchema.nullable(),
  checklist: z.boolean(),
  meal: z.boolean(),
  notify: z.boolean(),
  archivedAt: instantSchema.nullable(),
});

export type BlockRecord = z.infer<typeof blockRecord>;

const blockFields = {
  name: plannerNameSchema,
  icon: iconValueSchema.nullish(),
  /** Null is the kind's colour. */
  color: colourValueSchema.nullish(),
  startsAt: startTimeSchema,
  endsAt: endTimeSchema,
  rrule: rruleSchema.nullish(),
  onDate: dateKeySchema.nullish(),
  checklist: z.boolean().default(false),
  meal: z.boolean().default(false),
  notify: z.boolean().default(false),
};

/** The New block sheet's write: one of the seven kinds, never an old one. */
export const newBlockInput = z
  .object({
    kind: newBlockKindSchema,
    ...blockFields,
    fill: blockFillSchema.nullish(),
  })
  .superRefine(refineOneRepeat)
  .superRefine(refineEndsAfterStarts);

export type NewBlockInput = z.infer<typeof newBlockInput>;

/**
 * The sheet's New transition (D-USE-34): no kind, never. Inside a block it is
 * a `block_items` row: no repeat, since it takes the block's days, and a
 * start and a length. Outside every block it is a `blocks` row of kind
 * `transition` that chooses its own rule or date, like a block. Both arms are
 * strict, so a kind or a repeat sent inside a block is refused, not dropped.
 */
export const newTransitionInput = z
  .discriminatedUnion("placement", [
    z
      .object({
        placement: z.literal("in_block"),
        blockId: z.string().uuid(),
        name: plannerNameSchema,
        icon: iconValueSchema.nullish(),
        atTime: startTimeSchema,
        lengthMin: lengthMinutesSchema,
        meal: z.boolean().default(false),
        sortOrder: sortOrderSchema,
      })
      .strict(),
    z
      .object({
        placement: z.literal("between_blocks"),
        ...blockFields,
      })
      .strict(),
  ])
  .superRefine((value, ctx) => {
    if (value.placement === "between_blocks") {
      refineOneRepeat(value, ctx);
      refineEndsAfterStarts(value, ctx);
    }
  });

export type NewTransitionInput = z.infer<typeof newTransitionInput>;

/**
 * A change to a block's own fields. Kind stays what it was made as. A patch
 * that touches the repeat sends both `rrule` and `onDate`, exactly one set;
 * the server checks a lone time against the stored other one.
 */
export const editBlockInput = z
  .object({
    id: z.string().uuid(),
    name: plannerNameSchema.optional(),
    icon: iconValueSchema.nullish(),
    color: colourValueSchema.nullish(),
    startsAt: startTimeSchema.optional(),
    endsAt: endTimeSchema.optional(),
    rrule: rruleSchema.nullish(),
    onDate: dateKeySchema.nullish(),
    fill: blockFillSchema.nullish(),
    checklist: z.boolean().optional(),
    meal: z.boolean().optional(),
    notify: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.rrule !== undefined || value.onDate !== undefined) {
      refineOneRepeat(value, ctx);
    }
    refineEndsAfterStarts(value, ctx);
  });

export type EditBlockInput = z.infer<typeof editBlockInput>;

/*
 * ---- Block changes: one date of a repeating block ----
 */

export const blockChangeRecord = z.object({
  ...rowStamps,
  blockId: z.string().uuid(),
  onDate: dateKeySchema,
  skipped: z.boolean(),
  startsAt: startTimeSchema.nullable(),
  endsAt: endTimeSchema.nullable(),
  /** `0015` (USE-88's look): null reads the block's. */
  name: plannerNameSchema.nullable().default(null),
  icon: iconValueSchema.nullable().default(null),
  color: colourValueSchema.nullable().default(null),
});

export type BlockChangeRecord = z.infer<typeof blockChangeRecord>;

/** `block_changes_skipped_or_times_check`: skipped, or both times. */
export const blockChangeInput = z
  .object({
    blockId: z.string().uuid(),
    onDate: dateKeySchema,
    /** Absent is the column's default, false. */
    skipped: z.boolean().optional(),
    startsAt: startTimeSchema.nullish(),
    endsAt: endTimeSchema.nullish(),
    /** `0015`: the date's own look; a look-only row still carries both times. */
    name: plannerNameSchema.nullish(),
    icon: iconValueSchema.nullish(),
    color: colourValueSchema.nullish(),
  })
  .superRefine((value, ctx) => {
    if (!value.skipped && (value.startsAt == null || value.endsAt == null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startsAt"],
        message: "Skip the date or give both times.",
      });
    }
    refineEndsAfterStarts(value, ctx);
  });

export type BlockChangeInput = z.infer<typeof blockChangeInput>;

/*
 * ---- Block items ----
 */

const TRANSITION_NEEDS_TIME = "A transition needs a start and a length.";

export const blockItemRecord = z.object({
  ...rowStamps,
  blockId: z.string().uuid(),
  title: z.string(),
  icon: iconValueSchema.nullable(),
  isTransition: z.boolean(),
  atTime: startTimeSchema.nullable(),
  lengthMin: lengthMinutesSchema.nullable(),
  meal: z.boolean(),
  /** `0013`: the one date it is in its block ("This day only"); null is every date. */
  onDate: dateKeySchema.nullable(),
  sortOrder: sortOrderSchema,
});

export type BlockItemRecord = z.infer<typeof blockItemRecord>;

const blockItemFields = z.object({
  blockId: z.string().uuid(),
  title: plannerNameSchema,
  icon: iconValueSchema.nullish(),
  isTransition: z.boolean().default(false),
  atTime: startTimeSchema.nullish(),
  lengthMin: lengthMinutesSchema.nullish(),
  meal: z.boolean().default(false),
  onDate: dateKeySchema.nullish(),
  sortOrder: sortOrderSchema,
});

/** `block_items_transition_has_time_and_length_check` on a transition row. */
export const blockItemInput = blockItemFields.superRefine((value, ctx) => {
  if (value.isTransition && (value.atTime == null || value.lengthMin == null)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["atTime"],
      message: TRANSITION_NEEDS_TIME,
    });
  }
});

export type BlockItemInput = z.infer<typeof blockItemInput>;

/**
 * A change to one block item (USE-32; Make it Monday's usual). Absent is
 * unchanged, so the transition check refuses only a time or length cleared
 * on a row sent as a transition; the server checks the rest against the row.
 */
export const editBlockItemInput = blockItemFields
  .partial()
  .extend({
    id: z.string().uuid(),
    isTransition: z.boolean().optional(),
    meal: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.isTransition === true &&
      (value.atTime === null || value.lengthMin === null)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["atTime"],
        message: TRANSITION_NEEDS_TIME,
      });
    }
  });

export type EditBlockItemInput = z.infer<typeof editBlockItemInput>;

/*
 * ---- Slots: a block item, a to-do or a work item in a block on a date ----
 */

/** A plain item's Notes for the date (C-USE-item-sheet-1). */
export const slotNotesSchema = z.string().max(2000);

export const slotRecord = z.object({
  ...rowStamps,
  blockId: z.string().uuid(),
  onDate: dateKeySchema,
  /** `0013`: a set item left out on this date (Remove for today, Not today). */
  skipped: z.boolean(),
  sortOrder: sortOrderSchema,
  blockItemId: z.string().uuid().nullable(),
  todoId: z.string().uuid().nullable(),
  workItemId: z.string().uuid().nullable(),
  tier: workTierSchema.nullable(),
  lengthMin: lengthMinutesSchema.nullable(),
  /** `slots_took_min_check`: `>= 0`. */
  tookMin: z.number().int().min(0).nullable(),
  doneAt: instantSchema.nullable(),
  /**
   * `0015` (USE-87): a plain item's own values for the date; null reads the
   * item's. Absent in a record from before 0015 reads null.
   */
  notes: slotNotesSchema.nullable().default(null),
  atTime: startTimeSchema.nullable().default(null),
  icon: iconValueSchema.nullable().default(null),
});

export type SlotRecord = z.infer<typeof slotRecord>;

/**
 * `slots_one_target_check` and `slots_tier_only_for_work_check`: one target
 * of the three, and a tier only on a work item (D-USE-31).
 */
export const placeSlotInput = z
  .object({
    blockId: z.string().uuid(),
    onDate: dateKeySchema,
    /** Absent is the column's default, false. */
    skipped: z.boolean().optional(),
    sortOrder: sortOrderSchema,
    blockItemId: z.string().uuid().nullish(),
    todoId: z.string().uuid().nullish(),
    workItemId: z.string().uuid().nullish(),
    tier: workTierSchema.nullish(),
    lengthMin: lengthMinutesSchema.nullish(),
    notes: slotNotesSchema.trim().nullish(),
    atTime: startTimeSchema.nullish(),
    icon: iconValueSchema.nullish(),
  })
  .superRefine((value, ctx) => {
    const targets = [value.blockItemId, value.todoId, value.workItemId].filter(
      (target) => target != null,
    );
    if (targets.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["blockItemId"],
        message: "A slot holds one item, to-do or work item.",
      });
    }
    if (value.tier != null && value.workItemId == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tier"],
        message: "Only a work item takes a tier.",
      });
    }
  });

export type PlaceSlotInput = z.infer<typeof placeSlotInput>;

/** Which sessions a tier change moves (D-USE-57): this one, or every one. */
export const sessionsChoiceSchema = z.enum(["this", "all"]);

/**
 * The one slot-edit write (USE-16's fields, USE-32's beside them): check off
 * or uncheck, Change's `took_min`, reorder, skip, move block, day or tier,
 * change the length. Absent is unchanged. A tier change on a session names
 * This session or All sessions; a sessions choice with no tier is refused.
 * Only a work slot takes a tier: the server checks it against the stored
 * target (`slots_tier_only_for_work_check`).
 */
export const slotUpdateInput = z
  .object({
    id: z.string().uuid(),
    doneAt: instantSchema.nullish(),
    /** `slots_took_min_check`: `>= 0`. */
    tookMin: z.number().int().min(0).nullish(),
    sortOrder: sortOrderSchema.optional(),
    skipped: z.boolean().optional(),
    blockId: z.string().uuid().optional(),
    tier: workTierSchema.nullish(),
    sessions: sessionsChoiceSchema.optional(),
    onDate: dateKeySchema.optional(),
    lengthMin: lengthMinutesSchema.nullish(),
    /** `0015`: the date's own Notes, time and icon; null clears to the item's. */
    notes: slotNotesSchema.trim().nullish(),
    atTime: startTimeSchema.nullish(),
    icon: iconValueSchema.nullish(),
  })
  .superRefine((value, ctx) => {
    if (value.sessions !== undefined && value.tier == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sessions"],
        message: "Choose a tier to move the sessions to.",
      });
    }
  });

export type SlotUpdateInput = z.infer<typeof slotUpdateInput>;

/** Remove from today, or a session's ×: the slot goes, the item stays. */
export const removeSlotInput = z.object({ id: z.string().uuid() });

export type RemoveSlotInput = z.infer<typeof removeSlotInput>;

/*
 * ---- Slot events: the append-only clock ----
 */

export const slotEventRecord = z.object({
  id: z.string().uuid(),
  createdAt: instantSchema,
  slotId: z.string().uuid(),
  kind: slotEventKindSchema,
  clientEventId: z.string().uuid(),
  at: instantSchema,
  receivedAt: instantSchema,
  stepAwayId: z.string().uuid().nullable(),
});

export type SlotEventRecord = z.infer<typeof slotEventRecord>;

/** The step-away pair: the only events that carry a `stepAwayId`. */
const STEP_AWAY_KINDS = new Set(["paused", "resumed"]);

/**
 * One clock event as the device sends it. `at` is the device's time; the
 * server's two-minute and day-window test is the router's, not a zod rule.
 * `clientEventId` makes a replay idempotent (`slot_events_user_id_client_event_id_key`).
 */
export const slotEventInput = z
  .object({
    slotId: z.string().uuid(),
    kind: slotEventKindSchema,
    clientEventId: z.string().uuid(),
    at: instantSchema,
    stepAwayId: z.string().uuid().nullish(),
  })
  .superRefine((value, ctx) => {
    if (value.stepAwayId != null && !STEP_AWAY_KINDS.has(value.kind)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stepAwayId"],
        message: "Only a pause or a resume carries a step away.",
      });
    }
  });

export type SlotEventInput = z.infer<typeof slotEventInput>;

/*
 * ---- Day events: a fixed time on a date, never slotted ----
 */

export const dayEventRecord = z.object({
  ...rowStamps,
  onDate: dateKeySchema.nullable(),
  rrule: rruleSchema.nullable(),
  title: z.string(),
  icon: iconValueSchema.nullable(),
  startsAt: startTimeSchema,
  endsAt: endTimeSchema,
  tag: eventTagSchema,
  notes: z.string().nullable(),
  color: colourValueSchema.nullable(),
  clientId: z.string().uuid().nullable(),
});

export type DayEventRecord = z.infer<typeof dayEventRecord>;

/**
 * Add event's write: "Name needed" with no name, as the sheet's. One date or
 * one repeat rule, exactly one (`0013`'s `day_events_rrule_or_on_date_check`);
 * the desk popover's Work or Personal and Client, the phone sheet's Colour
 * and Notes (D-USE-42, D-USE-102). Null colour is plum.
 */
export const dayEventInput = z
  .object({
    onDate: dateKeySchema.nullish(),
    rrule: rruleSchema.nullish(),
    title: plannerNameSchema,
    icon: iconValueSchema.nullish(),
    startsAt: startTimeSchema,
    endsAt: endTimeSchema,
    tag: eventTagSchema.default("personal"),
    notes: z.string().trim().max(2000).nullish(),
    color: colourValueSchema.nullish(),
    clientId: z.string().uuid().nullish(),
  })
  .superRefine(refineOneRepeat)
  .superRefine(refineEndsAfterStarts);

export type DayEventInput = z.infer<typeof dayEventInput>;

/*
 * ---- Day bounds: Up at and Lights out (`0013`'s `day_bounds`) ----
 */

/** Set my days' words when Lights out is not after Up at. */
export const LIGHTS_OUT_AFTER_UP_AT = "Lights out comes after Up at.";

export const dayBoundsRecord = z.object({
  ...rowStamps,
  /** Monday 0 to Sunday 6; null on a date's own row. */
  weekday: weekdaySchema.nullable(),
  onDate: dateKeySchema.nullable(),
  upAt: startTimeSchema,
  lightsOut: startTimeSchema,
});

export type DayBoundsRecord = z.infer<typeof dayBoundsRecord>;

/**
 * A weekday's usual, or one date's own controls: exactly one
 * (`day_bounds_weekday_or_on_date_check`), and Lights out after Up at
 * (`day_bounds_lights_out_after_up_at_check`). A date's row wins over its
 * weekday's.
 */
export const dayBoundsInput = z
  .object({
    weekday: weekdaySchema.nullish(),
    onDate: dateKeySchema.nullish(),
    upAt: startTimeSchema,
    lightsOut: startTimeSchema,
  })
  .superRefine((value, ctx) => {
    if ((value.weekday == null) === (value.onDate == null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["weekday"],
        message: "Choose a weekday or one date.",
      });
    }
    if (value.lightsOut <= value.upAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lightsOut"],
        message: LIGHTS_OUT_AFTER_UP_AT,
      });
    }
  });

export type DayBoundsInput = z.infer<typeof dayBoundsInput>;

/*
 * ---- Day records: one per date (`day_records_user_id_on_date_key`) ----
 */

export const dayRecordRecord = z.object({
  ...rowStamps,
  onDate: dateKeySchema,
  orientedAt: instantSchema.nullable(),
  readyAt: instantSchema.nullable(),
  closedAt: instantSchema.nullable(),
});

export type DayRecordRecord = z.infer<typeof dayRecordRecord>;

/**
 * Orient's open and Ready, go (USE-96): the date and the instant to stamp.
 * The server keeps the first stamp; a later one never moves it.
 */
export const dayStampInput = z.object({
  dateKey: dateKeySchema,
  at: instantSchema,
});

export type DayStampInput = z.infer<typeof dayStampInput>;

/** The date a day read asks about (USE-96's readied-before). */
export const dateKeyInput = z.object({ dateKey: dateKeySchema });

export type DateKeyInput = z.infer<typeof dateKeyInput>;

/*
 * ---- Meal topics and saved colours ----
 */

export const mealTopicRecord = z.object({
  ...rowStamps,
  name: z.string(),
  icon: iconValueSchema.nullable(),
  linkKind: mealLinkKindSchema,
  linkValue: z.string(),
  sortOrder: sortOrderSchema,
});

export type MealTopicRecord = z.infer<typeof mealTopicRecord>;

export const mealTopicInput = z.object({
  name: plannerNameSchema,
  icon: iconValueSchema.nullish(),
  linkKind: mealLinkKindSchema,
  linkValue: z.string().trim().min(1).max(512),
  sortOrder: sortOrderSchema,
});

export type MealTopicInput = z.infer<typeof mealTopicInput>;

/** `saved_colours_hex_check`: lowercase `#rrggbb`. */
const savedHexSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^#[0-9a-f]{6}$/, "Use a colour like #a1b2c3.");

export const savedColourRecord = z.object({
  ...rowStamps,
  hex: savedHexSchema,
  sortOrder: sortOrderSchema,
});

export type SavedColourRecord = z.infer<typeof savedColourRecord>;

export const savedColourInput = z.object({
  hex: savedHexSchema,
  sortOrder: sortOrderSchema,
});

export type SavedColourInput = z.infer<typeof savedColourInput>;

/** One row by id: a remove, or a read of one (USE-97). */
export const idInput = z.object({ id: z.string().uuid() });

export type IdInput = z.infer<typeof idInput>;

/** `planner.savedColours.write`: a new colour, or with `id` a change to one. */
export const savedColourWriteInput = savedColourInput.extend({
  id: z.string().uuid().optional(),
});

export type SavedColourWriteInput = z.infer<typeof savedColourWriteInput>;

/** `planner.mealTopics.write`: a new topic, or with `id` a change to one. */
export const mealTopicWriteInput = mealTopicInput.extend({
  id: z.string().uuid().optional(),
});

export type MealTopicWriteInput = z.infer<typeof mealTopicWriteInput>;

/*
 * ---- The planner's writes as the router takes them (USE-92) ----
 */

/** The usual weekday an edit was made on, so the router can name its reach. */
export const writeScopeInput = z.object({ weekday: weekdaySchema });

export type WriteScopeInput = z.infer<typeof writeScopeInput>;

/** A write's own input with the usual weekday it was made on, when it was. */
export function scopedWriteInput<S extends z.ZodTypeAny>(input: S) {
  return z.object({ input, scope: writeScopeInput.optional() });
}

/**
 * This and following (USE-47): what the block's dates from `fromDate` take,
 * a block's own fields, never its repeat. The server checks a lone time
 * against the stored other one, as `editBlockInput`.
 */
export const splitBlockInput = z.object({
  id: z.string().uuid(),
  fromDate: dateKeySchema,
  patch: z
    .object({
      name: plannerNameSchema.optional(),
      icon: iconValueSchema.nullish(),
      color: colourValueSchema.nullish(),
      startsAt: startTimeSchema.optional(),
      endsAt: endTimeSchema.optional(),
      fill: blockFillSchema.nullish(),
      checklist: z.boolean().optional(),
      meal: z.boolean().optional(),
      notify: z.boolean().optional(),
    })
    .superRefine(refineEndsAfterStarts),
});

export type SplitBlockInput = z.infer<typeof splitBlockInput>;

/** With `date`, a set item is skipped on that date and stays usual. */
export const removeBlockItemInput = z.object({
  id: z.string().uuid(),
  date: dateKeySchema.optional(),
});

export type RemoveBlockItemInput = z.infer<typeof removeBlockItemInput>;

/** The block's items in their new order; with `date`, for that date only. */
export const reorderItemsInput = z.object({
  blockId: z.string().uuid(),
  ids: z.array(z.string().uuid()).max(500),
  date: dateKeySchema.optional(),
});

export type ReorderItemsInput = z.infer<typeof reorderItemsInput>;

/** Add event's write, or with `id` its edit. */
export const dayEventWriteInput = scopedWriteInput(dayEventInput).extend({
  id: z.string().uuid().optional(),
});

export type DayEventWriteInput = z.infer<typeof dayEventWriteInput>;

/** A write's Undo: the signed token it handed back. */
export const undoInput = z.object({ token: z.string().min(1).max(500_000) });

export type UndoInput = z.infer<typeof undoInput>;

/** What every planner write hands back: its Undo, the row, the reach. */
export const plannerWriteOutput = z.object({
  undo: z.string(),
  id: z.string().uuid().optional(),
  reach: z
    .object({ weekday: weekdaySchema, follows: dateKeySchema.nullable() })
    .optional(),
});

export type PlannerWriteOutput = z.infer<typeof plannerWriteOutput>;
