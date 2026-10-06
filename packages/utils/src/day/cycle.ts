import { daysBefore } from "./day-key";

/**
 * The passage and quote cycles — UX v1.2 §3.12, §13 #21 (RUN-4).
 *
 * "One passage per day: the frame opens on the next in list order after
 * yesterday's, advancing at day-open, wrapping." The index is PURE ARITHMETIC
 * over the date, not a stored cursor: nothing is written when the frame is
 * read, so nothing about the person is recorded from it. Adding a passage
 * shifts the cycle, which is fine and cheaper than a cursor.
 *
 * The quote bank uses the same function over the published rows, so two
 * people on the same day see the same quote and nobody sees one "for them".
 * `epoch` is `CYCLE_EPOCH` in `@syn/constants`, the same for both cycles.
 */
export function cycleIndex(
  count: number,
  dateKey: string,
  epoch: string,
): number | null {
  if (!Number.isInteger(count) || count <= 0) return null;
  const elapsed = daysBefore(epoch, dateKey);
  if (Number.isNaN(elapsed)) return null;
  return ((elapsed % count) + count) % count;
}
