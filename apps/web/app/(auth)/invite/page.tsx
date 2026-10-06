import { redirect } from "next/navigation";

import { AUTH_NOTICE } from "@/app/(auth)/_components/copy";
import { signUpRoute, withNotice } from "@/lib/routes";

/**
 * The shared invite link (Epic 1 ST-11, cross-cutting §4.1).
 *
 * A redirect rather than a second sign-up screen. There are no invite tokens
 * and no referral counts (official spec §4.1) — the link's only job is to
 * carry the one line that says the app is free and the list is private, so it
 * is a query flag on the one form.
 */
export default function InvitePage() {
  redirect(withNotice(signUpRoute(), AUTH_NOTICE.invite));
}
