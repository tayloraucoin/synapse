import type { DecisionState } from "@syn/types";

/**
 * Which panel state an undone item is in — Epic 3 DR-02 and DR-05.
 *
 * THE ORDER IS THE RULE, and it runs from most-specific to least. A shift's
 * casualty that the person has since re-decided in the review is *changed*,
 * not *resolved-by-shift*: the later decision is the one that counts, and
 * showing it as the shift's would hide the fact that they revisited it.
 *
 * *PENDING* IS ONLY REACHABLE ON A CLOSED DAY. On a live day an undecided item
 * is simply undecided — the day is still happening and nothing is owed yet.
 * The distinction is what makes the Review tab's dot mean "there is something
 * to answer" rather than "the day is not finished".
 */
export function decisionStateFor(
  item: { completionState: string },
  miss: {
    resolvedBy: "day_review" | "shift";
    shiftId: string | null;
  } | null,
  dayClosed: boolean,
): DecisionState {
  if (item.completionState === "carried") return "decided";

  if (miss !== null) {
    // Cut by a shift, then re-decided by hand in the review.
    if (miss.shiftId !== null && miss.resolvedBy === "day_review") {
      return "changed";
    }
    if (miss.resolvedBy === "shift") return "resolved-by-shift";
    return "decided";
  }

  return dayClosed ? "pending" : "undecided";
}
