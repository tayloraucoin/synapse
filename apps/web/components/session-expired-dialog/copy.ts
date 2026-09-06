/**
 * SY-04's strings — cross-cutting §10, verbatim.
 *
 * *Anything you changed is kept on this device.* is a promise about the local
 * cache, and it is literally true: the writes that reached the server are
 * committed, and the ones that did not are still in TanStack Query's cache and
 * in the timer store. If that ever stops being true the sentence has to change
 * before the behaviour does.
 *
 * NOTHING HERE APOLOGISES. A session expiring is the security model working,
 * not a fault — and *Signed out* is a statement, not bad news.
 */
export const SESSION_COPY = {
  title: "Signed out",
  body: "Sign in again to continue. Anything you changed is kept on this device.",
  /** Only when a timer is actually running. */
  timerRunning: "A running timer will be saved when you sign in.",
  signIn: "Sign in",
} as const;
