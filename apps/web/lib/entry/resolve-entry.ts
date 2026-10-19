import { sanitizeNextPath } from "@syn/utils";
import { todayRoute, verifyRoute } from "@/lib/routes";

/**
 * The entry decision tree — cross-cutting §4.2, run on every cold open and
 * every `/`.
 *
 * A pure function of state, so the layout that calls it stays a gate and the
 * rules stay readable in one place.
 *
 * CUT TO WHAT IS LIVE (USE-1). The first-run sequence, its launch counter and
 * the orient frame went to `_legacy/` with the old app; USE's Orient ticket
 * adds its own step back here. Until then: an unverified email goes to
 * `/verify`, and everyone else to where they were going, or Today.
 */

export type ResolveEntryInput = {
  isEmailVerified: boolean;
  /** Where the person was headed, if anywhere; sanitized before use. */
  intendedRoute?: string | null;
};

export function resolveEntry({
  isEmailVerified,
  intendedRoute,
}: ResolveEntryInput): string {
  if (!isEmailVerified) {
    return verifyRoute();
  }
  const target = intendedRoute
    ? sanitizeNextPath(intendedRoute, todayRoute())
    : null;
  return target ?? todayRoute();
}
