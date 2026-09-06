import type { ItemVerdict } from "./adherence";

/**
 * One square in the Week Review's seven-day habit strip — Epic 3 WR-01 §6.
 *
 * IT IS DERIVED FROM THE VERDICT, not from the row. The strip and the number
 * must agree: a square that reads *done* on a day the resolver excluded would
 * be the week disagreeing with itself in two places on the same screen. Every
 * square is one verdict, translated.
 *
 * A DAY WITH NO ITEM IS `not-assigned`, which is the same square an unplanned
 * day gets. That is deliberate — "nothing was assigned" and "nothing was
 * planned" are the same fact from the strip's point of view, and colouring
 * them differently would invite reading one as a failure.
 */
export type StripSquare =
  | "done"
  | "done-moved"
  | "not-counted"
  | "half"
  | "didnt-do"
  | "not-assigned"
  | "pending";

export function stripStateFor(verdict: ItemVerdict | null): StripSquare {
  switch (verdict) {
    case "done":
      return "done";
    case "done-moved":
      return "done-moved";
    case "half":
      return "half";
    case "missed":
      return "didnt-do";
    case "not-counted":
      return "not-counted";
    case "pending":
      return "pending";
    // `excluded` covers a trimmed item and one carried forward. Neither
    // happened on this day, and neither is a failure of it.
    case "excluded":
    case null:
    default:
      return "not-assigned";
  }
}
