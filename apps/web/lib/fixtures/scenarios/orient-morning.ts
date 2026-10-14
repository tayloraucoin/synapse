import { morningLinesRecord } from "@syn/validators";
import type { FixtureRecords } from "../records";
import { BASE_DATE, baseRecords, emptyRecords } from "./base-day";
import type { Scenario } from "./index";

/**
 * Orient's scenarios (USE-12): the base Monday before it is opened, so the
 * day has no record yet and the first open lands on Orient. Up at is 7:00;
 * the late open is 8:10. The reading's own `loading` and `error` hold only
 * the reading; the lines, last night and Review the day still work.
 */

function atOrient(time: string): string {
  return `${BASE_DATE}T${time}:00-04:00`;
}

/** The line on the boards, already saved: "Grateful for" grown to two lines. */
const GRATEFUL = morningLinesRecord.parse({
  onDate: BASE_DATE,
  grateful:
    "A slow start, the bath filling, and the light coming in over the trees.",
  intention: null,
  todayAsISeeIt: null,
});

/** The day not yet opened: no day record, Start not tapped on this device. */
function unopened(records: FixtureRecords, lines = [GRATEFUL]): FixtureRecords {
  return { ...records, dayRecords: [], morningLines: structuredClone(lines) };
}

function orient(
  name: string,
  time: string,
  records: FixtureRecords,
  extra: Partial<Scenario> = {},
): Scenario {
  return {
    name,
    now: atOrient(time),
    records,
    mode: "ready",
    startedOnDevice: false,
    ...extra,
  };
}

export const ORIENT_SCENARIOS: Record<string, () => Scenario> = {
  "orient-success": () =>
    orient("orient-success", "06:58", unopened(baseRecords())),
  "orient-late": () => orient("orient-late", "08:10", unopened(baseRecords())),
  // No passages and no evening written; the links are their own setting.
  "orient-empty": () =>
    orient("orient-empty", "06:58", unopened(emptyRecords())),
  "orient-loading": () =>
    orient("orient-loading", "06:58", unopened(baseRecords(), []), {
      reading: "loading",
    }),
  "orient-error": () =>
    orient("orient-error", "06:58", unopened(baseRecords()), {
      reading: "error",
    }),
  "orient-offline": () =>
    orient("orient-offline", "06:58", unopened(baseRecords()), {
      offline: true,
    }),
};
