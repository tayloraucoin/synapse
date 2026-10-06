import type { StripState, StripWeek } from "@syn/types";

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
/**
 * An ALIAS of `@syn/types`' `StripState`, not a second copy.
 *
 * The two were declared independently — the same seven members in two packages
 * — which is two places to add an eighth and one place to forget. `@syn/types`
 * is the lower layer and the one `@syn/ui` already reads, so it owns the
 * vocabulary and this name stays for the callers that use it.
 */
export type StripSquare = StripState;

/** Seven `not-assigned` squares — a habit with nothing on the week. */
export function emptyStripWeek(): StripWeek {
  return [
    "not-assigned",
    "not-assigned",
    "not-assigned",
    "not-assigned",
    "not-assigned",
    "not-assigned",
    "not-assigned",
  ];
}

/** Narrows a built array to the week tuple; throws only on a coding error. */
export function toStripWeek(days: readonly StripSquare[]): StripWeek {
  if (days.length !== 7) {
    throw new Error(`a strip week has seven days, not ${days.length}`);
  }
  return days as unknown as StripWeek;
}

export function stripStateFor(
  verdict: ItemVerdict | null,
  /**
   * UX v1.1 §8.2, R16 (DYN-19): a wind-down item left unconfirmed is
   * `excluded` to the resolver — untouched — but the strip shows it as its
   * own blank square with the label, so it is excluded and visible.
   */
  completionState?: string,
): StripSquare {
  if (completionState === "not_confirmed") return "not-confirmed";
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
