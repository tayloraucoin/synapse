/**
 * Where the first screen of a day goes (USE-12; D-USE-5, Orient's
 * `states/skipped.md`). Orient shows once a day: the open is the wake, and a
 * later open goes on to Review the day before Ready, go; to the welcome
 * between Ready, go and Start; and to Now after Start or once the day is
 * closed. A closed day never shows Orient.
 */

export type DayEntry = "orient" | "review" | "welcome" | "now";

/** The day record's three stamps, as `dayRecordRecord` carries them. */
export interface DayEntryRecord {
  orientedAt: string | null;
  readyAt: string | null;
  closedAt: string | null;
}

export function resolveDayEntry({
  dayRecord,
  startedOnDevice,
}: {
  /** The date's record; none yet is a day not oriented. */
  dayRecord: DayEntryRecord | null;
  /** "Start" has no column: it is remembered per device, by date. */
  startedOnDevice: boolean;
}): DayEntry {
  if (dayRecord?.closedAt != null) return "now";
  if (dayRecord?.orientedAt == null) return "orient";
  if (dayRecord.readyAt === null) return "review";
  return startedOnDevice ? "now" : "welcome";
}
