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
 * wire shapes are their own tickets'; only the columns Work shows are here.
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
});

export type WorkItemRecord = z.infer<typeof workItemRecord>;

export const workItemInput = z
  .object({
    title: plannerNameSchema,
    notes: z.string().trim().max(4000).nullish(),
    icon: iconValueSchema.nullish(),
    size: workSizeSchema.nullish(),
    lengthMinMin: lengthMinutesSchema.nullish(),
    lengthMaxMin: lengthMinutesSchema.nullish(),
    dueOn: dateKeySchema.nullish(),
    clientId: z.string().uuid().nullish(),
    parentWorkItemId: z.string().uuid().nullish(),
  })
  .superRefine(refineLengthRange);

export type WorkItemInput = z.infer<typeof workItemInput>;

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
