/**
 * The R18 line — UX v1.1 §5.2: "If the gratitude line was left empty
 * yesterday and today's field is empty as the person taps *Start the
 * morning*, the caption under the field reads, for that tap only: *Skipped
 * yesterday too.*"
 *
 * SAGE'S FOUR RULES, AS CODE. It appears on the second consecutive skip only
 * — never on the first (there is nothing to recall) and never on the third
 * and later (the person has decided; a third would be nagging). It never
 * appears more than once in seven days. It is one fact (the caller's string;
 * this decides only whether). The gratitude switch turns it off with the
 * field (the caller never asks when the switch is off).
 *
 * `skips` is yesterday-first: `skips[0]` is yesterday, `skips[1]` the day
 * before, and so on; `true` means the gratitude line was left empty (or the
 * day has no row at all — a day the app was not opened is a day nothing was
 * written). The caller passes up to eight days: yesterday and the seven
 * before it, which is what "once in seven days" needs to be checked against.
 *
 * "Once in seven days" is derived from the same history rather than stored:
 * the line would have shown on an earlier morning D whenever D's own
 * yesterday-first history met the first two rules. If any of the last seven
 * mornings did, today does not.
 */
export const SKIP_LINE_WINDOW_DAYS = 7;

export function shouldShowSkipLine(skips: ReadonlyArray<boolean>): boolean {
  const yesterday = skips[0] ?? false;
  const dayBefore = skips[1] ?? false;
  // Rule 1 and 2: the second consecutive skip, and only the second.
  if (!yesterday || dayBefore) return false;

  // Rule 3: not if an earlier morning in the window already showed it. On
  // morning D (i days ago, 1 ≤ i ≤ 7), yesterday was skips[i] and the day
  // before was skips[i + 1].
  for (let i = 1; i <= SKIP_LINE_WINDOW_DAYS; i += 1) {
    const thatYesterday = skips[i] ?? false;
    const thatDayBefore = skips[i + 1] ?? false;
    if (thatYesterday && !thatDayBefore) return false;
  }
  return true;
}
