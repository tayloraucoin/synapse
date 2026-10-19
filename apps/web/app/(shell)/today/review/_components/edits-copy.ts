import { weekdayForDayKey } from "@syn/utils";
import { clockLabel } from "@/components/planner/day-column/copy";

/**
 * Review the day's edit words (USE-37; first-edit.md, first-mornings.md,
 * after-swap-undo.md, no-work.md), exactly as drawn. No second person, no
 * counts of items; times are the only numbers.
 */
export const REVIEW_EDITS_COPY = {
  /** "Changes apply to today. Monday's usual stays as it is." */
  firstChange: (dateKey: string) =>
    `Changes apply to today. ${weekdayForDayKey(dateKey)}'s usual stays as it is.`,
  /** "Swapped for Yoga. Training ends 8:50." */
  swapped: (item: string, block: string, endsAt: string) =>
    `Swapped for ${item}. ${block} ends ${clockLabel(endsAt)}.`,
  /** A band swiped away [ASSUMPTION: the Item sheet's Not today words]. */
  offToday: (name: string) => `${name} is off today.`,
  /** The rail + (words-and-access.md). */
  plus: (at: string) => `Add, at ${clockLabel(at)}`,
  plusHow: "Hold and drag to pick the time",
  /** The + hint on the first mornings (D-USE-18). */
  hint: "Tap to add. Hold and drag up or down to pick the time.",
  gotIt: "Got it",
  /** An empty Work block (D-USE-2, D-USE-22). */
  noWork: "Nothing slotted for today. Work is set with the week, in This week.",
  addToPrimary: "Add to Primary",
  addToSecondary: "Add to Secondary",
  openThisWeek: "Open This week",
} as const;
