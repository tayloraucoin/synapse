/**
 * useDeviceZone — the device's own IANA zone, and the ONE place the app asks
 * for it (SYS-2's ruling; cross-cutting §7.3).
 *
 * WHY ONE PLACE. Two readers is how the status line and the header end up
 * disagreeing about whether the person has travelled: one re-reads on a
 * visibility change, the other caches from the first render, and a screen shows
 * *Your device is in Europe/London* above a header that still says *times in
 * London* after the switch. The grep in SYS-2's acceptance criteria exists to
 * keep it one place — `detectTimezone` in `@syn/constants` is the only function
 * in the codebase that asks `Intl` what zone the device is in, and this hook is
 * the only way app code reaches it.
 *
 * NULL ON THE SERVER, DELIBERATELY. The server has no device, so the snapshot
 * it renders is "unknown" — no mismatch line, no zone label — and the client's
 * first render matches it. Every consumer treats null as "no claim", which is
 * also the honest answer in an embed where `Intl` returns nothing.
 *
 * RE-READ ON `visibilitychange`, not on an interval. A zone changes when the
 * phone lands and the OS updates it, which is a thing that happens while the
 * tab is in the background; coming back to the tab is exactly when the answer
 * needs to be right, and polling a value that changes twice a year is not.
 */
"use client";

import { useSyncExternalStore } from "react";

import { detectTimezone } from "@syn/constants";

/**
 * Cached because `useSyncExternalStore` calls `getSnapshot` on every render and
 * must return a stable value between store events: building an
 * `Intl.DateTimeFormat` each time is waste, and the string it returns is
 * compared by value anyway.
 */
let cached: string | null = null;

function read(): string {
  cached ??= detectTimezone();
  return cached;
}

function subscribe(onChange: () => void): () => void {
  const handler = (): void => {
    const previous = cached;
    cached = detectTimezone();
    if (cached !== previous) onChange();
  };

  document.addEventListener("visibilitychange", handler);
  return () => {
    document.removeEventListener("visibilitychange", handler);
  };
}

/** The device zone, or null before hydration. */
export function useDeviceZone(): string | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
