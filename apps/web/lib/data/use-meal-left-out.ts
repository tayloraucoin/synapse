"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * The topics a meal leaves out (USE-49; meal-editing.md, D-USE-28, D-USE-30):
 * a tap on a chip leaves it out of this meal for every such weekday, or
 * offers it again. No table holds a meal's choice yet, so it is kept on this
 * device per block and weekday [ASSUMPTION] until a follow-up gives it a
 * column. `seed` stands a `?state=` capture's choice before storage reads.
 */
export function mealLeftOutKey(blockId: string, weekday: number): string {
  return `synapse:meal-left-out:${blockId}:${weekday}`;
}

export function useMealLeftOut(
  blockId: string,
  weekday: number,
  seed: readonly string[] = [],
): [ReadonlySet<string>, (topicId: string) => void] {
  const key = mealLeftOutKey(blockId, weekday);
  const [ids, setIds] = useState<ReadonlySet<string>>(() => new Set(seed));

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) setIds(new Set(JSON.parse(stored) as string[]));
    } catch {
      // Storage unavailable or unreadable: every topic is offered.
    }
  }, [key]);

  const toggle = useCallback(
    (topicId: string) => {
      setIds((current) => {
        const next = new Set(current);
        if (next.has(topicId)) next.delete(topicId);
        else next.add(topicId);
        try {
          window.localStorage.setItem(key, JSON.stringify([...next]));
        } catch {
          // Best-effort: the choice still holds for this session.
        }
        return next;
      });
    },
    [key],
  );

  return [ids, toggle];
}
