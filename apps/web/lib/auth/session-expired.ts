/**
 * The one signal that says a session has lapsed — SY-04.
 *
 * WHY NOT CONTEXT, AND WHY NOT A STORE. The two things that DETECT expiry are
 * outside React: the tRPC link's error handler and Supabase's
 * `onAuthStateChange`. A Context provider cannot be called from either, and
 * `lib/stores/README.md` sets a deliberately high bar for a second Zustand
 * store — a wide tree, a high frequency, and a measurement — which a thing that
 * happens once an hour at most does not clear.
 *
 * So it is a module-level flag with subscribers, read through
 * `useSyncExternalStore`: the same shape `useOnline` and `useDeviceZone`
 * already use in this app. No provider to mount in the right place, no store to
 * justify, and the detectors can call a plain function.
 *
 * IT LATCHES. Once expired, it stays expired until the person signs in — the
 * dialog has one action and no dismiss, so there is nothing to reset it to. The
 * latch is also the ref-guard the ticket asks for: two `UNAUTHORIZED` errors in
 * a burst set the same boolean and notify subscribers who are already showing
 * the dialog, which renders once.
 */

let expired = false;
/** Set while the APP is signing someone out on purpose. */
let deliberate = false;
const listeners = new Set<() => void>();

/** Called by the tRPC error link and by the auth-state listener. */
export function notifySessionExpired(): void {
  // A sign-out the app asked for is not an expiry. Signing out and deleting an
  // account both end the session and both fire `SIGNED_OUT`, and a dialog
  // saying *Sign in again to continue* while someone is deliberately leaving
  // would be the app arguing with them.
  if (deliberate || expired) return;
  expired = true;
  for (const listener of listeners) listener();
}

/**
 * Called BEFORE the app ends a session itself — `/logout` (AU-06) and Delete
 * account (ST-10a). It is never unset: both paths leave with a document load,
 * so the flag dies with the page, and a flag that outlived one would be worse
 * than the dialog it suppresses.
 */
export function beginDeliberateSignOut(): void {
  deliberate = true;
}

export function subscribeSessionExpired(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readSessionExpired(): boolean {
  return expired;
}

/** The server has no session to have lost. */
export function serverSessionExpired(): boolean {
  return false;
}
