import { dayRecordRecord } from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import type { Scenario } from "./index";
import { weekRecords } from "./week";

/**
 * The desk's Today frame (USE-58): the Week's 12 to 18 Oct (USE-72's
 * records) on Monday the 12th at 10:20, the day oriented and readied, so
 * /today lands on Today with the week strip over it and the day column
 * beside it. `today-opened-day` is the same week, captured with
 * `&date=2026-10-13`: Tuesday opened from the Week, planning.
 */

/** Monday 12 October, 10:20 in Toronto, as the boards draw Today. */
export const TODAY_DESK_NOW = "2026-10-12T10:20:00-04:00";

const STAMP = "2026-10-12T11:00:00.000Z";

function todayDeskRecords(): FixtureRecords {
  const records = weekRecords();
  return {
    ...records,
    dayRecords: [
      ...records.dayRecords.filter((row) => row.onDate !== "2026-10-12"),
      dayRecordRecord.parse({
        id: fixtureId(0, 490),
        createdAt: STAMP,
        updatedAt: STAMP,
        onDate: "2026-10-12",
        orientedAt: "2026-10-12T10:55:00.000Z",
        readyAt: "2026-10-12T11:05:00.000Z",
        closedAt: null,
      }),
    ],
  };
}

function desk(name: string): () => Scenario {
  return () => ({
    name,
    now: TODAY_DESK_NOW,
    records: todayDeskRecords(),
    mode: "ready",
  });
}

export const TODAY_DESK_SCENARIOS: Record<string, () => Scenario> = {
  "today-desk": desk("today-desk"),
  "today-opened-day": desk("today-opened-day"),
};
