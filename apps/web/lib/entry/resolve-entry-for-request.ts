import { isEmailVerified } from "@syn/auth";
import { getRequestAuthContext } from "@/lib/auth/get-request-context";
import { resolveEntry } from "./resolve-entry";

/**
 * Runs the entry decision tree against the current request.
 *
 * Returns the path to redirect to, or `null` when there is no session — the
 * caller decides what that means, because only the caller knows the path to
 * put in `next`.
 *
 * It reads no rows since USE-1: the first-run and orient checks that needed
 * the profile and the day went to `_legacy/`. A later step that reads a row
 * goes through `auth.rls`, never the singleton `db`.
 */
export async function resolveEntryForRequest(
  intendedRoute?: string | null,
): Promise<string | null> {
  const auth = await getRequestAuthContext();
  if (!auth) return null;

  return resolveEntry({
    isEmailVerified: isEmailVerified(auth.user),
    intendedRoute,
  });
}
