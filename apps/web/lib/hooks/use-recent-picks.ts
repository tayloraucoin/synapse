/**
 * useRecentPicks — the icon picker's Recent row (USE-11): the last eight
 * emoji and the last eight icons picked, on this device only, newest first.
 * Kept in localStorage as `useRememberedToggle` keeps its flags; read in an
 * effect, so the first paint is the empty row.
 */
"use client";

import { useCallback, useEffect, useState } from "react";

export interface RecentPicks {
  emoji: string[];
  icon: string[];
}

const KEY = "synapse.icon-picker.recent";
export const RECENT_LIMIT = 8;
const EMPTY: RecentPicks = { emoji: [], icon: [] };

/** A pick moved to the front, without repeats, at most eight. */
export function withRecent(list: readonly string[], id: string): string[] {
  return [id, ...list.filter((item) => item !== id)].slice(0, RECENT_LIMIT);
}

function read(): RecentPicks {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "");
    if (parsed && typeof parsed === "object") {
      const { emoji, icon } = parsed as Partial<RecentPicks>;
      const strings = (v: unknown) =>
        Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
      return { emoji: strings(emoji), icon: strings(icon) };
    }
  } catch {
    // Nothing stored yet, or storage unavailable.
  }
  return EMPTY;
}

export function useRecentPicks(
  seed?: RecentPicks,
): [RecentPicks, (set: keyof RecentPicks, id: string) => void] {
  const [recent, setRecent] = useState<RecentPicks>(seed ?? EMPTY);

  useEffect(() => {
    if (!seed) setRecent(read());
  }, [seed]);

  const remember = useCallback((set: keyof RecentPicks, id: string) => {
    setRecent((current) => {
      const next = { ...current, [set]: withRecent(current[set], id) };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // Best-effort: Recent still holds for this session.
      }
      return next;
    });
  }, []);

  return [recent, remember];
}
