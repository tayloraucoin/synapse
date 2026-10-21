import { z } from "zod";
import { linkRecord, passageRecord } from "./morning";
import { instantSchema } from "./planner";

/**
 * Settings › Morning reading's inputs and its one read (USE-150; D-USE-120
 * to D-USE-125). One procedure per verb, the kind as a parameter: a passage
 * and a link order, turn off, turn on and delete alike. The two forms stay
 * `passageFormSchema` and `linkFormSchema`.
 */

export const readingKind = z.enum(["passage", "link"]);

export type ReadingKind = z.infer<typeof readingKind>;

/** A section's full list of active ids, top first; the service refuses one that is not. */
export const reorderReadingInput = z.object({
  kind: readingKind,
  ids: z.array(z.string().uuid()).min(1),
});

export type ReorderReadingInput = z.infer<typeof reorderReadingInput>;

/** Turn off, or delete an off row. */
export const readingRowInput = z.object({
  kind: readingKind,
  id: z.string().uuid(),
});

export type ReadingRowInput = z.infer<typeof readingRowInput>;

/** `restore` is the toast's Undo: back where it was; otherwise at the end (D-USE-123, D-USE-124). */
export const turnOnInput = readingRowInput.extend({
  restore: z.boolean().optional(),
});

export type TurnOnInput = z.infer<typeof turnOnInput>;

const offStamp = { archivedAt: instantSchema };

/** Active rows in Orient's order; off rows by when they went off, newest first (D-USE-133). */
export const readingListRecord = z.object({
  passages: z.array(passageRecord),
  passagesOff: z.array(passageRecord.extend(offStamp)),
  links: z.array(linkRecord),
  linksOff: z.array(linkRecord.extend(offStamp)),
});

export type ReadingListRecord = z.infer<typeof readingListRecord>;
