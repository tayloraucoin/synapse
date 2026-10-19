"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { SESSION_COPY as COPY } from "./copy";

/**
 * SY-04 — Signed out.
 *
 * ONE ACTION, NO WAY OUT BUT SIGNING IN. There is no dismiss, no scrim close,
 * and Esc does nothing: the app cannot do anything useful without a session, so
 * a dialog that could be waved away would leave a person clicking a screen that
 * silently fails. The document gives one action and this gives one action.
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
          <AlertDialogDescription>{COPY.body}</AlertDialogDescription>
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
