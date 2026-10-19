"use client";

import { useDismissed } from "@/lib/hooks/use-dismissed";
import { DEFAULT_SCENARIO } from "./scenario-names";
import { useDataSource } from "./source";

/**
 * A one-time line (USE-37): `[seen, markSeen]` through `useDismissed` at the
 * `forever` scope. A named scenario keeps its own flag, and its `seen` list
 * counts a line as already seen, so a capture of one state is never covered
 * by another's line or by the device's own dismissal.
 */
export function useFirstTime(key: string): [boolean, () => void] {
  const { scenario } = useDataSource();
  const scoped =
    scenario.name === DEFAULT_SCENARIO ? key : `${scenario.name}:${key}`;
  const [dismissed, dismiss] = useDismissed(scoped, "forever");
  return [dismissed || (scenario.seen?.includes(key) ?? false), dismiss];
}
