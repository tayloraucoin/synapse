import { journalEntryRecord } from "@syn/validators";
import type { FixtureRecords } from "../records";
import { BASE_DATE } from "./base-day";
import type { Scenario } from "./index";
import { nowDayRecords } from "./now-day";

/**
 * Close the day's scenarios (USE-44), at `/day/2026-10-12/journal`: Taylor's
 * Monday at 21:50, its Tuesday reading "Wellness at 7:05, then Training"
 * (the now-day blocks run daily and on weekdays). The read-only pair is the
 * Tuesday morning, Monday opened from Review.
 */

/** The board's five lines, the sixth left empty (journal-402) [placeholder]. */
const FIVE_ANSWERS = {
  day_went: "Slow start, but the sync spec got written. [placeholder]",
  gratitude_today: "The cold bath, and a long lunch outside. [placeholder]",
  gratitude_life: "People who check in. [placeholder]",
  looking_forward: "Training at the Y. [placeholder]",
  make_happen_tomorrow: "Ship the Paper handoff. [placeholder]",
};

function monday(answers: Record<string, string> | null): FixtureRecords {
  return {
    ...nowDayRecords([]),
    journalEntries:
      answers === null
        ? []
        : [journalEntryRecord.parse({ onDate: BASE_DATE, answers })],
  };
}

function close(
  name: string,
  time: string,
  records: FixtureRecords,
  extra: Partial<Scenario> = {},
  date = BASE_DATE,
): Scenario {
  return {
    name,
    now: `${date}T${time}:00-04:00`,
    records,
    mode: "ready",
    ...extra,
  };
}

const TUESDAY = "2026-10-13";

export const CLOSE_THE_DAY_SCENARIOS: Record<string, () => Scenario> = {
  // Five written, the sixth focused (its ink underline), Saved, the peek.
  "close-journal": () =>
    close("close-journal", "21:50", monday(FIVE_ANSWERS), {
      view: { open: "field:visualisation" },
    }),
  // Nothing written yet: six empty fields, no Saved.
  "close-empty": () => close("close-empty", "21:50", monday(null)),
  // No connection: the words kept on the device.
  "close-offline": () =>
    close("close-offline", "21:50", monday(FIVE_ANSWERS), { offline: true }),
  // Monday opened from Review on Tuesday morning: serif text, no fields.
  "close-read-only": () =>
    close(
      "close-read-only",
      "08:30",
      monday(FIVE_ANSWERS),
      { openedFrom: "review" },
      TUESDAY,
    ),
  // The same, with nothing written that night.
  "close-nothing-written": () =>
    close(
      "close-nothing-written",
      "08:30",
      monday(null),
      { openedFrom: "review" },
      TUESDAY,
    ),
};
