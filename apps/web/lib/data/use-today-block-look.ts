"use client";

import { useCallback, useEffect, useState } from "react";
import type { IconValue } from "@syn/types";

/**
 * Today's own name and icon for a block (USE-48; header-menu.md: Rename and
 * Icon and colour, "today only" [ASSUMPTION]). `block_changes` holds no
 * name, icon or colour yet, so the look is kept on this device for the date
 * until the schema follow-up gives it a column; the usual block is never
 * written. Read in an effect, so the first paint is the block's own look.
 */
export interface TodayBlockLook {
  name?: string;
  icon?: IconValue;
}

export function todayBlockLookKey(date: string, blockId: string): string {
  return `synapse:block-look:${date}:${blockId}`;
}

export function useTodayBlockLook(
  date: string,
  blockId: string,
): [TodayBlockLook, (next: TodayBlockLook) => void] {
  const key = todayBlockLookKey(date, blockId);
  const [look, setLook] = useState<TodayBlockLook>({});

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) setLook(JSON.parse(stored) as TodayBlockLook);
    } catch {
      // Storage unavailable or unreadable: the block's own look stands.
    }
  }, [key]);

  const set = useCallback(
    (next: TodayBlockLook) => {
      setLook(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Best-effort: the look still holds for this session.
      }
    },
    [key],
  );

  return [look, set];
}
