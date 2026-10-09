import { redirect } from "next/navigation";

import { isEmailVerified, type AuthUser } from "@syn/auth";
import { sanitizeNextPath } from "@syn/utils";

import { homeRoute, verifyRoute } from "@/lib/routes";

/**
 * Sends an authenticated-but-unverified person to `/verify` (official spec
 * §4.1: the verify-pending state blocks the app).
 *
 * The Supabase "Confirm email" setting is the primary gate. This is the
 * app-layer assertion that survives a dashboard-config regression, which is
 * the failure it exists for — a toggle flipped in a console is not a change
 * anything in this repository would otherwise notice.
 */
export function requireVerifiedEmail(user: AuthUser, nextPath?: string): void {
  if (isEmailVerified(user)) {
    return;
  }
  const safeNext = nextPath
    ? sanitizeNextPath(nextPath, homeRoute())
    : undefined;
  redirect(verifyRoute(safeNext));
}
