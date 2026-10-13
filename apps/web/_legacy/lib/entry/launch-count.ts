import { cookies } from "next/headers";

/**
 * How many times this browser has opened the app.
 *
 * A COOKIE, NOT A COLUMN. The entry tree only needs "has this person seen the
 * setup redirect a few times already", which is a per-browser fact about
 * arriving, not a fact about the account. A column would need a write on every
 * cold open — a database round trip on the hottest path in the app, to answer
 * a question a cookie answers for free.
 *
 * The cost of being wrong is small and symmetric: clearing cookies re-offers
 * setup to someone who skipped it, and a second device offers it again. Both
 * are a wizard you can leave. Swapping to a `users` column later is a
 * one-function change, which is why this is the cheap honest version now.
 */
export const LAUNCH_COUNT_COOKIE = "syn_launches";

/** A year — long enough that "the first three launches" means what it says. */
const LAUNCH_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;

export async function readLaunchCount(): Promise<number> {
  const store = await cookies();
  const raw = store.get(LAUNCH_COUNT_COOKIE)?.value;
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/**
 * Increments and returns the new count.
 *
 * Only callable where cookies are writable (a route handler or a server
 * action). A layout reads; it does not write — Next forbids it, and a layout
 * that could write would increment on every navigation rather than every open.
 */
export async function incrementLaunchCount(): Promise<number> {
  const store = await cookies();
  const next = (await readLaunchCount()) + 1;
  store.set(LAUNCH_COUNT_COOKIE, String(next), {
    maxAge: LAUNCH_COOKIE_MAX_AGE_SEC,
    path: "/",
    sameSite: "lax",
    httpOnly: true,
  });
  return next;
}
