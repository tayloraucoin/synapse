/**
 * useRememberedToggle — a preference set once (reuse CC).
 *
 * Synapse's uses are the dismissals: `useDismissed`'s per-key flags and the
 * reminder sheet's never-again. CC's warning about keying by user id does not
 * apply here — Synapse is single-player and there is no pass-the-device flow —
 * but the key should still name what it remembers, because these outlive
 * releases.
 *
 * Read in an effect, never in the initializer: the first paint is `fallback`,
 * so `fallback` must be the state that is safe to show for one frame. For a
 * dismissal that means `false` — "not yet dismissed" — and a line that flashes
 * once is better than a line that never appears.
 */
"use client";

import { useCallback, useEffect, useState } from "react";

export function useRememberedToggle(
  key: string,
  fallback: boolean,
): [boolean, (next: boolean) => void] {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored === "true" || stored === "false") setValue(stored === "true");
    } catch {
      // Storage unavailable — the fallback stands for this run.
    }
  }, [key]);

  const set = useCallback(
    (next: boolean) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, String(next));
      } catch {
        // Best-effort: the choice still holds for this session.
      }
    },
    [key],
  );

  return [value, set];
}
