import { sanitizeNextPath } from "@syn/utils";

import { orientRoute, setupRoute, todayRoute, verifyRoute } from "@/lib/routes";

/**
 * The entry decision tree — cross-cutting §4.2, run on every cold open and
 * every `/`.
 *
 * A pure function of state, so the layout that calls it stays a gate and the
 * rules stay readable in one place.
 */

/**
 * How many launches still route an unfinished setup back into the sequence.
 *
 * Cross-cutting §4.2: "on the first three launches only; after that, land on
 * `/today` with the resume status line, so a person who deliberately skipped
 * setup isn't dragged back every time." Being dragged back to a wizard you
 * chose to leave is the product telling you it knows better.
 */
export const SETUP_REDIRECT_LAUNCH_LIMIT = 3;

export type EntryProfile = {
  /** Null until first run is finished. */
  firstRunCompletedAt: Date | string | null;
  /** Which step to resume at, 1–12 (UX v1.1 §4). */
  firstRunStep: number | null;
};

/**
 * Today's waking state — UX v1.1 §5.1: the orient frame comes before any tab
 * while the day has no `woke_at` and is not closed. Null when the caller has
 * no day to ask about (no account row yet).
 */
export type EntryToday = {
  wokeAt: Date | string | null;
  closed: boolean;
};

export type ResolveEntryInput = {
  /** False when the session exists but the email is unverified. */
  isEmailVerified: boolean;
  profile: EntryProfile | null;
  /** How many times this browser has opened the app. */
  launchCount: number;
  /**
   * Where the person was actually trying to go — a deep link, or the path the
   * sign-in redirect remembered. Honoured once setup is not owed.
   */
  intendedRoute?: string | null;
  today?: EntryToday | null;
};

/**
 * Returns the path to send an authenticated person to.
 *
 * Callers have already established that there IS a session; "no session →
 * `/signin`" is the layout's job, because only the layout knows the path to
 * put in `next`.
 */
export function resolveEntry({
  isEmailVerified,
  profile,
  launchCount,
  intendedRoute,
  today = null,
}: ResolveEntryInput): string {
  // §4.2 step 2 — an unverified email blocks everything else.
  if (!isEmailVerified) {
    return verifyRoute();
  }

  // §4.2 step 3 — first run, but only while the person has not yet shown that
  // leaving it was deliberate.
  const setupIncomplete = !profile?.firstRunCompletedAt;
  if (setupIncomplete && launchCount <= SETUP_REDIRECT_LAUNCH_LIMIT) {
    const step = clampSetupStep(profile?.firstRunStep);
    return setupRoute(step);
  }

  // UX v1.1 §5.1 — the orient frame before any tab, once per day: the day has
  // no wake yet and is not closed. A deep link waits behind it; a closed day
  // (auto-closed at 03:00 before the frame was ever opened) is skipped, and
  // the next day's frame is the next open's.
  if (today !== null && today.wokeAt === null && !today.closed) {
    return orientRoute();
  }

  // §4.2 step 4/5 — a deep link, else today. Pending reviews never redirect;
  // they surface as the status line and the Review dot.
  if (intendedRoute) {
    return sanitizeNextPath(intendedRoute, todayRoute());
  }
  return todayRoute();
}

/** The fourteen screens of UX v1.2 §4 (RUN-8). Anything out of range resumes at the beginning. */
export const SETUP_STEP_COUNT = 14;

function clampSetupStep(step: number | null | undefined): number {
  if (!step || step < 1 || step > SETUP_STEP_COUNT) return 1;
  return Math.floor(step);
}
