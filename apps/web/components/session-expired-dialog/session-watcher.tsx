"use client";

import * as React from "react";

import { createClient, hasSupabasePublicEnv } from "@/lib/clients/supabase/client";
import { notifySessionExpired } from "@/lib/auth/session-expired";

/**
 * The second of SY-04's two detections — the first is the tRPC error link.
 *
 * WHY TWO. The link catches a request that came back `UNAUTHORIZED`, which is
 * what happens when someone acts. This catches a session that ends while
 * nothing is being asked for — a token revoked from another device, a password
 * changed elsewhere — so a tab left open on the List does not sit there looking
 * signed in until the person taps something.
 *
 * A DELIBERATE SIGN-OUT IS NOT AN EXPIRY. `SIGNED_OUT` fires on `/logout` and
 * on Delete account too, and a dialog saying *Sign in again to continue* while
 * someone is deliberately leaving would be the app arguing with them. Both of
 * those navigate away with a document load, so the guard is simply that this
 * component is still mounted and was mounted with a session — a real expiry
 * happens under a page that is still sitting there.
 *
 * IT RENDERS NOTHING. `proxy.ts` refreshes silently on every navigation, so the
 * dialog appears only when a refresh actually failed.
 */
export function SessionWatcher() {
  React.useEffect(() => {
    if (!hasSupabasePublicEnv()) return;

    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      /*
       * `TOKEN_REFRESHED` and `SIGNED_IN` are the healthy path and say nothing.
       * `SIGNED_OUT` is the one that matters — and it reaches here only while
       * this component is mounted, which a deliberate sign-out is not (both
       * `/logout` and Delete account leave with a full document load).
       */
      if (event === "SIGNED_OUT") notifySessionExpired();
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return null;
}
