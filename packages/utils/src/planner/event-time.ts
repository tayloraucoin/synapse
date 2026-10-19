/**
 * The event-time check the router calls before a slot event is written
 * (USE-5). `at` is the device's time: it must fall inside its slot's day and
 * may run at most two minutes ahead of the server. How late it arrives is not
 * checked, so an offline replay received hours later still passes.
 */

/** How far a device's clock may run ahead of the server's. */
export const EVENT_AHEAD_LIMIT_MS = 120_000;

export type EventTimeCheck =
  | { ok: true }
  | { ok: false; reason: "before-day" | "after-day" | "ahead-of-now" };

/** `dayWindow` is `[start, end)`, as `dayWindow` in `day/boundaries.ts` gives it. */
export function checkEventTime({
  at,
  dayWindow,
  serverNow,
}: {
  at: string;
  dayWindow: { start: Date; end: Date };
  serverNow: Date;
}): EventTimeCheck {
  const atMs = Date.parse(at);
  if (Number.isNaN(atMs) || atMs < dayWindow.start.getTime())
    return { ok: false, reason: "before-day" };
  if (atMs >= dayWindow.end.getTime())
    return { ok: false, reason: "after-day" };
  if (atMs > serverNow.getTime() + EVENT_AHEAD_LIMIT_MS)
    return { ok: false, reason: "ahead-of-now" };
  return { ok: true };
}
