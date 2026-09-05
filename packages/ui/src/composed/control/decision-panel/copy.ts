/**
 * DecisionPanel's strings — Epic 3 DR-02 / DR-05.
 *
 * The weight phrases come from the tier, and they are words, never
 * percentages: a review that showed "50%" would be scoring the day, which
 * official spec §2.4 rules out.
 */
import type { MissTier } from "@syn/types";

export const DECISION_PANEL_COPY = {
  carryForward: "Carry forward",
  missed: "Missed",
  change: "Change",
  carriedTo: "Carry forward → tomorrow",
  carriedNote: (count: number, since: string) =>
    `Carried ${count} times since ${since}.`,
  changedFromShift: "Changed from the shift's reason.",
  addNote: "Add a note",
  noteLabel: "Note",
} as const;

/** The phrase that says what the decision weighs — official spec §3.4. */
export const WEIGHT_PHRASE: Record<MissTier, string> = {
  circumstance: "not counted",
  scoping: "counts half",
  chose_not_to: "counts as missed",
};

export const TRADED_UP_PHRASE = "traded up · not counted";
