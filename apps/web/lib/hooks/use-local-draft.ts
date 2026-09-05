/**
 * useLocalDraft — text a person typed survives a reload (reuse CC).
 *
 * CC's hook. Used by the item sheet's note field and the Day Review's note:
 * a thought written at 11pm and lost to a backgrounded tab is the kind of loss
 * that stops someone writing the next one.
 *
 * RESTORE IN AN EFFECT, NEVER IN THE INITIALIZER. The component server-renders
 * too, and reading `localStorage` during render is a hydration mismatch. The
 * first paint is therefore empty and the draft arrives one frame later.
 *
 * Local-only by design. A draft is not a decision; it does not belong in the
 * database until the person saves it.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const LOCAL_DEBOUNCE_MS = 300;

export function useLocalDraft(key: string) {
  const [restoredDraft, setRestoredDraft] = useState<string | null>(null);
  const restored = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null && stored.trim() !== "") setRestoredDraft(stored);
    } catch {
      // Storage unavailable — nothing to restore.
    }
  }, [key]);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const persistDraft = useCallback(
    (content: string) => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        try {
          if (content.trim() !== "") window.localStorage.setItem(key, content);
          else window.localStorage.removeItem(key);
        } catch {
          // Storage unavailable — the in-memory value stands for this run.
        }
      }, LOCAL_DEBOUNCE_MS);
    },
    [key],
  );

  const clearDraft = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Best-effort.
    }
    setRestoredDraft(null);
  }, [key]);

  return { restoredDraft, persistDraft, clearDraft };
}
