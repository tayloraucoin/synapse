/**
 * useDismissed — one mechanism for every dismissible line (§12 call 12).
 *
 * CC has three separate dismissal mechanisms; the handoff's call is that
 * Synapse has one, with the difference expressed as a *scope*:
 *
 *  - `session` — gone until the tab is closed (setup-incomplete).
 *  - `day` — gone until tomorrow, in the day's own zone (the late offer).
 *  - `forever` — never returns (the install offer).
 *
 * The scope is stored *in the value*, not just in the key, so a stored flag
 * carries its own expiry and a scope changed in a later release does not leave
 * a line permanently hidden.
 *
 * Read in an effect, never in the initializer — the first paint is
 * "not dismissed", which is the safe frame: a line that flashes once is better
 * than one that never appears. Same rule as `useRememberedToggle`.
 */
"use client";

import { useCallback, useEffect, useState } from "react";

export type DismissScope = "session" | "day" | "forever";

const PREFIX = "syn:dismissed:";

function storageFor(scope: DismissScope): Storage | null {
  try {
    return scope === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

/** Whether a stored flag still hides its line (pure, so a test reads it). */
export function readDismissal(
  store: Pick<Storage, "getItem">,
  key: string,
  scope: DismissScope,
  dayKey?: string,
): boolean {
  const stored = store.getItem(`${PREFIX}${key}`);
  if (stored === null) return false;
  return scope === "day" ? stored === dayKey : stored === "1";
}

/** The flag a dismissal stores: its scope's own value. */
export function writeDismissal(
  store: Pick<Storage, "setItem">,
  key: string,
  scope: DismissScope,
  dayKey?: string,
): void {
  store.setItem(`${PREFIX}${key}`, scope === "day" ? (dayKey ?? "1") : "1");
}

export function useDismissed(
  key: string,
  scope: DismissScope,
  /** The day key ("YYYY-MM-DD") in the day's zone — required for `day`. */
  dayKey?: string,
): [boolean, () => void] {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const store = storageFor(scope);
    if (store === null) return;
    try {
      setDismissed(readDismissal(store, key, scope, dayKey));
    } catch {
      // Storage unavailable — the line shows for this run.
    }
  }, [dayKey, scope, key]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    const store = storageFor(scope);
    if (store === null) return;
    try {
      writeDismissal(store, key, scope, dayKey);
    } catch {
      // Best-effort: the dismissal still holds for this run.
    }
  }, [dayKey, scope, key]);

  return [dismissed, dismiss];
}
