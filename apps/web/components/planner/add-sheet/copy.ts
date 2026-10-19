import type { WorkTier } from "@syn/types";

/**
 * The add sheet's words (USE-54; add-from-the-rail/states/add-sheet.md), as
 * drawn. No second person; times and lengths are the only numbers.
 */
export const ADD_SHEET_COPY = {
  /** The canvas title, with the scope line above it (replaces "Add at 10:15"). */
  title: "Add",
  close: "Close",
  /** "Monday · lands in Work, 9:30 to 12:00" */
  scope: (weekday: string, block: string, from: string, to: string) =>
    `${weekday} · lands in ${block}, ${from} to ${to}`,
  /** [ASSUMPTION] A time outside every block: "Monday · no block at 6:30". */
  noBlock: (weekday: string, at: string | null) =>
    at === null ? weekday : `${weekday} · no block at ${at}`,
  kind: "Add as",
  item: "Item",
  block: "Block",
  name: "Name",
  /** [ASSUMPTION] The name field's accessible placeholder. */
  namePlaceholder: "Name",
  icon: (word: string | null) => (word ? `Icon, ${word}` : "Pick an icon"),
  iconBack: (name: string) => name || "Add",
  starts: "Starts",
  earlier: "15 minutes earlier",
  later: "15 minutes later",
  length: "Length",
  shorter: "Shorter",
  longer: "Longer",
  setTime: "At a set time",
  /** "Stays at 10:15 when things move" */
  setTimeLine: (at: string | null) =>
    at === null
      ? "Stays at its time when things move"
      : `Stays at ${at} when things move`,
  tier: "Tier",
  notes: "Notes (optional)",
  notesPlaceholder: "Details, links, anything to remember",
  /** "Work is full at 10:15. Adding asks where the 15 min comes from." */
  full: (block: string, at: string | null, minutes: number) =>
    `${block} is full${at === null ? "" : ` at ${at}`}. Adding asks where the ${minutes} min comes from.`,
  /** [ASSUMPTION] Outside every block an item has nowhere to go; Block makes one. */
  noBlockLine: "Items go in a block. Pick Block to make one here.",
  add: "Add",
  nameNeeded: "Name needed",
  /** [ASSUMPTION] The Toaster after a silent add, as Copy from's "Training added at 12:00." */
  added: (title: string, at: string | null, block: string) =>
    at === null ? `${title} added to ${block}.` : `${title} added at ${at}.`,
  undoOf: (title: string) => `adding ${title}`,
  notAdded: "Not added.",
} as const;

export const TIER_WORDS: Record<WorkTier, string> = {
  urgent: "Urgent",
  primary: "Primary",
  secondary: "Secondary",
  stretch: "Stretch",
};
