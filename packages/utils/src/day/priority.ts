/**
 * The trim and shift-cut sort — official spec §6.6.
 *
 * "Trims and shift-cut suggestions sort ascending (1 first). Ties: shorter
 * duration first, then later start."
 *
 * Ascending means the LEAST important thing is offered first, which is the
 * whole point: what gets cut is what matters least. The tie-breaks then prefer
 * removing something small and late over something long and early, because
 * the day has already been partly lived by the time a trim is asked for.
 */
export type PrioritySortable = {
  priority: number;
  durationMin: number | null;
  scheduledStart: Date | null;
};

export function compareForTrim(a: PrioritySortable, b: PrioritySortable): number {
  if (a.priority !== b.priority) return a.priority - b.priority;

  const aDuration = a.durationMin ?? 0;
  const bDuration = b.durationMin ?? 0;
  if (aDuration !== bDuration) return aDuration - bDuration;

  const aStart = a.scheduledStart?.getTime() ?? 0;
  const bStart = b.scheduledStart?.getTime() ?? 0;
  // Later start first.
  return bStart - aStart;
}
