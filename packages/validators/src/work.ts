import { z } from "zod";
import { CLIENT_COLOR_KEYS, DONE_SOURCES, WORK_SIZES } from "@syn/constants";
import { iconValueSchema } from "./icon";
import { dateKeySchema } from "./keys";
import {
  instantSchema,
  lengthMinutesSchema,
  plannerNameSchema,
  sortOrderSchema,
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
