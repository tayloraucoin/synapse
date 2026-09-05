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

export function useDismissed(
  key: string,
  scope: DismissScope,
  /** The day key ("YYYY-MM-DD") in the day's zone — required for `day`. */
  dayKey?: string,
): [boolean, () => void] {
  const [dismissed, setDismissed] = useState(false);
  const storageKey = `${PREFIX}${key}`;

  useEffect(() => {
    const store = storageFor(scope);
    if (store === null) return;
    try {
      const stored = store.getItem(storageKey);
      if (stored === null) return;
      if (scope === "day") setDismissed(stored === dayKey);
      else setDismissed(stored === "1");
    } catch {
      // Storage unavailable — the line shows for this run.
    }
  }, [dayKey, scope, storageKey]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    const store = storageFor(scope);
    if (store === null) return;
    try {
      store.setItem(storageKey, scope === "day" ? (dayKey ?? "1") : "1");
    } catch {
      // Best-effort: the dismissal still holds for this run.
    }
  }, [dayKey, scope, storageKey]);

  return [dismissed, dismiss];
}
