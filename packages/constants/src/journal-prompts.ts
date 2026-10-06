/**
 * The default journal prompts — UX v1.1 §7.2, the six in order, last is the
 * visualisation.
 *
 * WHY PROSE IS ALLOWED HERE. The same exception `STARTER_LIBRARY` and
 * `DEFAULT_REASONS` document: these labels are data the person owns and edits
 * (Settings → Closing the day lets them rename, reorder, remove, and add), not
 * copy the app speaks. A new person's set starts from these rows; from then on
 * the prompts are theirs.
 *
 * `key` IS WHAT `journal_entries.answers` IS KEYED BY (TD-7). The morning
 * reads `make_happen_tomorrow`, `visualisation` and `looking_forward` by key,
 * so a renamed prompt keeps its answers and a removed one simply stops being
 * read. Keys are stable identifiers and never shown.
 *
 * The migration that adds `users.journal_prompts` (DYN-3) carries these six
 * as its column default — a copy, once, into history. This file is the living
 * one.
 */

export type DefaultJournalPrompt = {
  readonly key: string;
  readonly label: string;
};

export const DEFAULT_JOURNAL_PROMPTS: ReadonlyArray<DefaultJournalPrompt> = [
  { key: "day_went", label: "How the day went" },
  { key: "gratitude_today", label: "Grateful for today" },
  { key: "gratitude_life", label: "Grateful for, in life" },
  { key: "looking_forward", label: "Looking forward to" },
  { key: "make_happen_tomorrow", label: "What I want to make happen tomorrow" },
  { key: "visualisation", label: "Tomorrow, as I see it" },
] as const;

/** The three the orient frame reads back, in the order they are shown (v1.1 §5.2). */
export const ORIENT_READBACK_KEYS = [
  "make_happen_tomorrow",
  "visualisation",
  "looking_forward",
] as const;
