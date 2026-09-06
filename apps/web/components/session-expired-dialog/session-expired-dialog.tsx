"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@syn/ui";

import {
  readSessionExpired,
  serverSessionExpired,
  subscribeSessionExpired,
} from "@/lib/auth/session-expired";
import { signInRoute } from "@/lib/routes";
import { useTimerStore } from "@/lib/stores/use-timer-store";

import { SESSION_COPY as COPY } from "./copy";

/**
 * SY-04 — Signed out.
 *
 * ONE ACTION, NO WAY OUT BUT SIGNING IN. There is no dismiss, no scrim close,
 * and Esc does nothing: the app cannot do anything useful without a session, so
 * a dialog that could be waved away would leave a person clicking a screen that
 * silently fails. The document gives one action and this gives one action.
 *
 * IT NEVER LOSES A RUNNING TIMER, and it says so. The timer store keeps
 * ticking behind the dialog — it is client state, and nothing about the session
 * stops it — so the elapsed time is intact when they come back. USE-3's
 * `timer.start` is idempotent on a resumed session, so signing in writes what
 * the store already knows. The third sentence appears only when a timer is
 * actually running, because promising to save something that is not there is
 * how a person learns to stop reading the dialog.
 *
 * **Sign in** CARRIES THE PATH, INCLUDING THE QUERY. Sheet state lives in the
 * query string in this app, so `?sheet=item&id=…` is part of where they were —
 * dropping it would return them to the right screen with the wrong thing open.
 * `sanitizeNextPath` on the sign-in side is what makes that safe to round-trip.
 *
 * NEVER ON THE `(auth)` GROUP. This is mounted in the signed-in shell only, so
 * a lapsed session on `/signin` shows nothing — which is correct, because that
 * screen is already the answer.
 */
export function SessionExpiredDialog() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const expired = React.useSyncExternalStore(
    subscribeSessionExpired,
    readSessionExpired,
    serverSessionExpired,
  );

  const timerRunning = useTimerStore(
    (state) => Object.keys(state.running).length > 0,
  );

  if (!expired) return null;

  const query = search.toString();
  const next = query.length > 0 ? `${pathname}?${query}` : pathname;

  return (
    <AlertDialog open>
      <AlertDialogContent
        // No dismiss: the only way out is signing in.
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{COPY.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {COPY.body}
            {timerRunning ? (
              <>
                {" "}
                {COPY.timerRunning}
              </>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => router.replace(signInRoute(next))}>
            {COPY.signIn}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
