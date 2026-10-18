import { z } from "zod";
import {
  CLIENT_COLOR_KEYS,
  DONE_SOURCES,
  WORK_SIZES,
  WORK_TIERS,
} from "@syn/constants";
import { iconValueSchema } from "./icon";
import { dateKeySchema } from "./keys";
import {
  instantSchema,
  lengthMinutesSchema,
  plannerNameSchema,
  sessionsChoiceSchema,
  slotRecord,
  sortOrderSchema,
  workTierSchema,
} from "./planner";

/**
 * Work (USE-3): the work pool's items and the clients they belong to. Tiers
 * slot an item into a day (D-USE-31; `placeSlotInput`). Linear's and Google's
 * wire shapes are in `linear.ts` and `google.ts` (USE-32); only the columns
 * Work shows are here.
 */

export const workSizeSchema = z.enum(WORK_SIZES);
export const doneSourceSchema = z.enum(DONE_SOURCES);
export const clientColorKeySchema = z.enum(CLIENT_COLOR_KEYS);

type LengthRange = {
  lengthMinMin?: number | null;
  lengthMaxMin?: number | null;
};

/** `work_items_length_range_check`: the minimum is never above the maximum. */
function refineLengthRange(value: LengthRange, ctx: z.RefinementCtx) {
  if (
    value.lengthMinMin != null &&
    value.lengthMaxMin != null &&
    value.lengthMinMin > value.lengthMaxMin
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["lengthMaxMin"],
      message: "The longest is at least the shortest.",
    });
  }
}

export const workItemRecord = z.object({
  id: z.string().uuid(),
  createdAt: instantSchema,
  updatedAt: instantSchema,
  title: z.string(),
  notes: z.string().nullable(),
  icon: iconValueSchema.nullable(),
  /** Null is unsized. */
  size: workSizeSchema.nullable(),
  lengthMinMin: lengthMinutesSchema.nullable(),
  lengthMaxMin: lengthMinutesSchema.nullable(),
  dueOn: dateKeySchema.nullable(),
  clientId: z.string().uuid().nullable(),
  parentWorkItemId: z.string().uuid().nullable(),
  doneAt: instantSchema.nullable(),
  doneSource: doneSourceSchema.nullable(),
  archivedAt: instantSchema.nullable(),
  linearIdentifier: z.string().nullable(),
  /** 0012's link to a placed issue (USE-32); both null when unlinked. */
  linearConnectionId: z.string().uuid().nullable(),
  linearIssueId: z.string().nullable(),
});

export type WorkItemRecord = z.infer<typeof workItemRecord>;

const workItemFields = z.object({
  title: plannerNameSchema,
  notes: z.string().trim().max(4000).nullish(),
  icon: iconValueSchema.nullish(),
  size: workSizeSchema.nullish(),
  lengthMinMin: lengthMinutesSchema.nullish(),
  lengthMaxMin: lengthMinutesSchema.nullish(),
  dueOn: dateKeySchema.nullish(),
  clientId: z.string().uuid().nullish(),
  parentWorkItemId: z.string().uuid().nullish(),
});

export const workItemInput = workItemFields.superRefine(refineLengthRange);

export type WorkItemInput = z.infer<typeof workItemInput>;

/**
 * A change to a work item (USE-32): any of its fields, the range checked when
 * both ends are sent. The server checks a lone end against the stored other.
 */
export const editWorkItemInput = workItemFields
  .partial()
  .extend({ id: z.string().uuid() })
  .superRefine(refineLengthRange);

export type EditWorkItemInput = z.infer<typeof editWorkItemInput>;

export const clientRecord = z.object({
  id: z.string().uuid(),
  createdAt: instantSchema,
  updatedAt: instantSchema,
  name: z.string(),
  colorKey: clientColorKeySchema,
  /** An uploaded logo's storage path (D-USE-42); null shows the letter tile. */
  logoPath: z.string().nullable(),
  sortOrder: sortOrderSchema,
  archivedAt: instantSchema.nullable(),
});

export type ClientRecord = z.infer<typeof clientRecord>;

export const clientInput = z.object({
  name: plannerNameSchema,
  colorKey: clientColorKeySchema,
  logoPath: z.string().trim().min(1).max(512).nullish(),
  sortOrder: sortOrderSchema,
});

export type ClientInput = z.infer<typeof clientInput>;

/** A new client, or with `id` a change to one (USE-104's `client.write`). */
export const clientWriteInput = clientInput.extend({
  id: z.string().uuid().optional(),
});

export type ClientWriteInput = z.infer<typeof clientWriteInput>;

/** Remove client, or its Undo (USE-86): `archived_at` set or cleared. */
export const clientArchivedInput = z.object({
  id: z.string().uuid(),
  archived: z.boolean(),
});

export type ClientArchivedInput = z.infer<typeof clientArchivedInput>;

/** The clients' order as dragged (USE-32): every id once, top first. */
export const clientOrderInput = z.object({
  ids: z
    .array(z.string().uuid())
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length, "Each client once."),
});

export type ClientOrderInput = z.infer<typeof clientOrderInput>;

/** Settings' Clients switch: `users.clients_enabled`. */
export const clientsEnabledInput = z.object({ enabled: z.boolean() });

export type ClientsEnabledInput = z.infer<typeof clientsEnabledInput>;

/**
 * New task (USE-51, moved here by USE-98): the item, its tier, and the days
 * to place it on, each in that day's Work block. `item` is
 * `workItemInput`'s fields, parsed there with its words.
 */
export const createTaskInput = z.object({
  item: z.unknown(),
  tier: z.enum(WORK_TIERS),
  days: z.array(
    z.object({ dateKey: dateKeySchema, blockId: z.string().uuid() }),
  ),
});

export type CreateTaskInput = z.input<typeof createTaskInput>;

/** Mark done, reopen, back to the pool, remove from Synapse (USE-98). */
export const workItemIdInput = z.object({ workItemId: z.string().uuid() });

export type WorkItemIdInput = z.infer<typeof workItemIdInput>;

/**
 * The pool read (USE-55, live in USE-98): the work neither done nor
 * archived, their sessions with skipped ones left out, the clients not
 * archived in their order, and the Clients switch. The web app's
 * `PoolRecords`; USE-101 adds the Linear snapshot.
 */
export const poolReadOutput = z.object({
  clientsEnabled: z.boolean(),
  clients: z.array(clientRecord),
  workItems: z.array(workItemRecord),
  slots: z.array(slotRecord),
});

export type PoolReadOutput = z.infer<typeof poolReadOutput>;

/*
 * ---- Work sessions (USE-99, moved from the fixture's WorkServer) ----
 *
 * Each names a work item's session in the words the sheets use; the server
 * parses it again through `placeSlotInput` or `slotUpdateInput`, so a slot's
 * own rules refuse in their words. One item sits once a day
 * (`slots_work_item_id_on_date_key`, D-USE-40).
 */

/** Place, or a drop from the pool: one session, in a block, on a date. */
export const placeWorkInput = z.object({
  workItemId: z.string().uuid(),
  dateKey: dateKeySchema,
  blockId: z.string().uuid(),
  tier: workTierSchema.nullable(),
  sortOrder: sortOrderSchema,
});

export type PlaceWorkInput = z.infer<typeof placeWorkInput>;

/** Move to, or the tier drag (USE-71): a session's date, block, tier or place. */
export const moveWorkInput = z.object({
  slotId: z.string().uuid(),
  dateKey: dateKeySchema.optional(),
  blockId: z.string().uuid().optional(),
  tier: workTierSchema.nullish(),
  sortOrder: sortOrderSchema.optional(),
});

export type MoveWorkInput = z.input<typeof moveWorkInput>;

/** A session's ×: off its day, the item stays in the pool. */
export const unplaceWorkInput = z.object({ slotId: z.string().uuid() });

export type UnplaceWorkInput = z.infer<typeof unplaceWorkInput>;

/**
 * Spread across the week (USE-77, C-USE-spread-1): one session a picked
 * day, each its length, in one tier; `lengthMaxMin` is the item's hours
 * when Work left was changed, left out they stay.
 */
export const spreadWorkInput = z.object({
  workItemId: z.string().uuid(),
  tier: workTierSchema,
  sessions: z
    .array(
      z.object({
        dateKey: dateKeySchema,
        blockId: z.string().uuid(),
        lengthMin: z.number(),
      }),
    )
    .min(1),
  lengthMaxMin: z.number().optional(),
});

export type SpreadWorkInput = z.input<typeof spreadWorkInput>;

/**
 * A tier change (D-USE-57): This session, or All the item's open sessions.
 * A missing tier passes here so `slotUpdateInput` refuses it in its words.
 */
export const setWorkTierInput = z.object({
  slotId: z.string().uuid(),
  tier: workTierSchema.nullable(),
  sessions: sessionsChoiceSchema,
});

export type SetWorkTierInput = z.infer<typeof setWorkTierInput>;

/**
 * The place sheet's Place (USE-80): the one item on every picked day, a
 * session each in the one tier, all in one write with one Undo. A day's
 * `sortOrder` left out is after the block's own slots on the date.
 */
export const placeOnDaysInput = z.object({
  workItemId: z.string().uuid(),
  tier: workTierSchema,
  days: z
    .array(
      z.object({
        dateKey: dateKeySchema,
        blockId: z.string().uuid(),
        sortOrder: sortOrderSchema.optional(),
      }),
    )
    .min(1),
});

export type PlaceOnDaysInput = z.input<typeof placeOnDaysInput>;
