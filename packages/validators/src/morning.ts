import { z } from "zod";
import {
  INTENTION_MAX,
  MORNING_GRATITUDE_MAX,
  VISUALISATION_MAX,
} from "@syn/constants";
import { journalPromptKeySchema } from "./journal";
import { dateKeySchema } from "./keys";
import { instantSchema, sortOrderSchema } from "./planner";

/**
 * The morning's reads and its one write (USE-12), as Orient reads them. Wave
 * 3 reads them from the old `passages`, `links`, `quotes`, `days` and
 * `journal_entries` tables; the names here follow the screen, so the lines
 * are `grateful`, `intention` and `todayAsISeeIt` (the `days` row's
 * `gratitude`, `intention` and `visualisation`).
 */

const rowStamps = {
  id: z.string().uuid(),
  createdAt: instantSchema,
  updatedAt: instantSchema,
};

/** One passage of the morning reading: Markdown, with storage keys for images. */
export const passageRecord = z.object({
  ...rowStamps,
  title: z.string().nullable(),
  bodyMd: z.string(),
  images: z.array(z.string()),
  sortOrder: sortOrderSchema,
});

export type PassageRecord = z.infer<typeof passageRecord>;

/** A link under the reading; the kind is derived from the host and stored. */
export const linkRecord = z.object({
  ...rowStamps,
  title: z.string(),
  url: z.string(),
  kind: z.enum(["spotify", "other"]),
  sortOrder: sortOrderSchema,
});

export type LinkRecord = z.infer<typeof linkRecord>;

/** The quote on its day: one more slide, captioned "A quote" (D-USE-63). */
export const quoteRecord = z.object({
  ...rowStamps,
  onDate: dateKeySchema,
  text: z.string(),
  attribution: z.string().nullable(),
});

export type QuoteRecord = z.infer<typeof quoteRecord>;

/** The three lines under "Before the day", each optional. */
export const morningLinesRecord = z.object({
  onDate: dateKeySchema,
  grateful: z.string().nullable(),
  intention: z.string().nullable(),
  todayAsISeeIt: z.string().nullable(),
});

export type MorningLinesRecord = z.infer<typeof morningLinesRecord>;

/** An autosave: only the lines it sends change. */
export const morningLinesInput = z.object({
  onDate: dateKeySchema,
  grateful: z.string().max(MORNING_GRATITUDE_MAX).optional(),
  intention: z.string().max(INTENTION_MAX).optional(),
  todayAsISeeIt: z.string().max(VISUALISATION_MAX).optional(),
});

export type MorningLinesInput = z.infer<typeof morningLinesInput>;

/** An evening's journal, answers by prompt key; "Last night" reads yesterday's. */
export const journalEntryRecord = z.object({
  onDate: dateKeySchema,
  answers: z.record(journalPromptKeySchema, z.string()),
});

export type JournalEntryRecord = z.infer<typeof journalEntryRecord>;
