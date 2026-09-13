import { eq } from "drizzle-orm";

import { users } from "@syn/db";

import { getRequestAuthContext } from "@/lib/auth/get-request-context";
import { isEmailVerified } from "@syn/auth";

import { getServerApi } from "@/lib/trpc/server";

import { readLaunchCount } from "./launch-count";
import { resolveEntry, type EntryToday } from "./resolve-entry";

/**
 * Runs the entry decision tree against the current request.
 *
 * Returns the path to redirect to, or `null` when there is no session — the
 * caller decides what that means, because only the caller knows the path to
 * put in `next`.
 *
 * THE PROFILE READ GOES THROUGH RLS. `getRequestAuthContext()` hands back an
 * `rls` client; the singleton `db` would read the row as the table owner and
 * skip every policy. This is server code, so the temptation is real and the
 * rule is the same as everywhere else.
 */
export async function resolveEntryForRequest(
  intendedRoute?: string | null,
): Promise<string | null> {
  const auth = await getRequestAuthContext();
  if (!auth) return null;

  const [profile] = await auth.rls.execute((tx) =>
    tx
      .select({
        firstRunCompletedAt: users.firstRunCompletedAt,
        firstRunStep: users.firstRunStep,
      })
      .from(users)
      .where(eq(users.id, auth.user.id))
      .limit(1),
  );

  return resolveEntry({
    isEmailVerified: isEmailVerified(auth.user),
    profile: profile ?? null,
    launchCount: await readLaunchCount(),
    intendedRoute,
    today: await readToday(profile?.firstRunCompletedAt ?? null),
  });
}

/**
 * Today's waking state for the orient rule (UX v1.1 §5.1) — read only once
 * setup is done, because the sequence comes first and `day.today` resolves
 * the day (and applies a due settings change) as a side effect a person still
 * in setup has not earned. Never load-bearing: a failed read means no frame
 * this open, not a broken gate.
 */
async function readToday(firstRunCompletedAt: Date | null): Promise<EntryToday | null> {
  if (firstRunCompletedAt === null) return null;
  try {
    const api = await getServerApi();
    const today = await api.day.today();
    return { wokeAt: today.wokeAt, closed: today.closedAt !== null };
  } catch {
    return null;
  }
}
