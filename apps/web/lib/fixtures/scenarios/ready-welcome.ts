import {
  blockChangeRecord,
  dayRecordRecord,
  morningLinesRecord,
} from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import { BASE_DATE } from "./base-day";
import type { Scenario } from "./index";
import { NOW_IDS, onNowDay } from "./now-day";
import { onSunday, SUNDAY_DATE, sundayRecords } from "./now-forms";
import { reviewDayRecords } from "./review-day";

/**
 * The Ready, go welcome (USE-43; interactions/ready-go/): Review the day's
 * Monday (USE-31) just after Ready, go, Start not yet tapped. Orient's
 * "Today, as I see it" line is written, and Ready, go was given the day
 * before, so the welcome is the plain one; the first go ever has no day
 * before it with `readyAt`. The late wake is the Monday at 8:22 with
 * Training under way from 8:15 (the late review's layout, written as the
 * date's change); the checklist day is Now's Sunday (USE-17). Bracketed
 * words are the boards' placeholders.
 *
 * Ids count from 601, clear of the other surfaces'.
 */

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };

const MONDAY_LINE =
  "Slow start, cold bath, then one real push on the launch before lunch. [placeholder]";
const SUNDAY_LINE =
  "Nothing to prove today. Groceries, then a long walk. [placeholder]";

/** The Sunday before the Monday: readied, so the Monday is not the first. */
const DAY_BEFORE = "2026-10-11";

function lines(onDate: string, todayAsISeeIt: string) {
  return morningLinesRecord.parse({
    onDate,
    grateful: null,
    intention: null,
    todayAsISeeIt,
  });
}

function dayRecord(
  n: number,
  onDate: string,
  orientedAt: string,
  readyAt: string,
) {
  return dayRecordRecord.parse({
    ...stamps,
    id: fixtureId(0, 600 + n),
    onDate,
    orientedAt,
    readyAt,
    closedAt: null,
  });
}

/** An earlier day given Ready, go: the welcome is not the first ever. */
const readiedBefore = dayRecord(
  1,
  DAY_BEFORE,
  `${DAY_BEFORE}T07:00:00-04:00`,
  `${DAY_BEFORE}T07:30:00-04:00`,
);

/** The Monday, oriented and readied as `oriented` and `ready` say. */
function mondayRecords({
  oriented = "06:55",
  ready = "07:02",
  firstEver = false,
}: {
  oriented?: string;
  ready?: string;
  firstEver?: boolean;
} = {}): FixtureRecords {
  const records = reviewDayRecords();
  return {
    ...records,
    morningLines: [lines(BASE_DATE, MONDAY_LINE)],
    dayRecords: [
      ...(firstEver ? [] : [readiedBefore]),
      {
        ...records.dayRecords[0]!,
        orientedAt: onNowDay(oriented),
        readyAt: onNowDay(ready),
      },
    ],
  };
}

/** Woke at 8:10: Wellness folded, Training under way from 8:15 to its end. */
function lateWakeRecords(): FixtureRecords {
  const records = mondayRecords({ oriented: "08:10", ready: "08:22" });
  return {
    ...records,
    blockChanges: [
      ...records.blockChanges,
      blockChangeRecord.parse({
        ...stamps,
        // `block_changes` has no digit of its own: this surface's run.
        id: fixtureId(1, 601),
        blockId: NOW_IDS.blocks.training,
        onDate: BASE_DATE,
        skipped: false,
        startsAt: "08:15",
        endsAt: "08:57",
      }),
    ],
  };
}

/** Now's Sunday, readied at 9:40, with Orient's line and a day readied before. */
function checklistDayRecords(): FixtureRecords {
  const records = sundayRecords("day");
  return {
    ...records,
    morningLines: [lines(SUNDAY_DATE, SUNDAY_LINE)],
    dayRecords: [readiedBefore, ...records.dayRecords],
  };
}

function welcome(
  name: string,
  now: string,
  records: () => FixtureRecords,
  extra: Partial<Scenario> = {},
): () => Scenario {
  return () => ({
    name,
    now,
    records: records(),
    mode: "ready",
    startedOnDevice: false,
    ...extra,
  });
}

export const READY_SCENARIOS: Record<string, () => Scenario> = {
  "ready-welcome": welcome("ready-welcome", onNowDay("07:02"), () =>
    mondayRecords(),
  ),
  "ready-first-go-ever": welcome("ready-first-go-ever", onNowDay("07:02"), () =>
    mondayRecords({ firstEver: true }),
  ),
  "ready-late-wake": welcome(
    "ready-late-wake",
    onNowDay("08:22"),
    lateWakeRecords,
  ),
  "ready-checklist-day": welcome(
    "ready-checklist-day",
    onSunday("09:40"),
    checklistDayRecords,
  ),
  "ready-offline": welcome(
    "ready-offline",
    onNowDay("07:02"),
    () => mondayRecords(),
    { offline: true },
  ),
};
