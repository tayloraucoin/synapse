import { describe, expect, it } from "vitest";
import {
  occurrences,
  occursOn,
  parseRule,
  presetRule,
  type RepeatPreset,
  type RepeatRule,
} from "./rrule";

/** Parse or fail the test with the reason. */
function rule(text: string): RepeatRule {
  const parsed = parseRule(text);
  if (!parsed.ok) throw new Error(parsed.reason);
  return parsed.rule;
}

const from = (start: string, body: string): RepeatRule =>
  rule(`DTSTART;VALUE=DATE:${start.replaceAll("-", "")}\nRRULE:${body}`);

function preset(name: RepeatPreset, start: string): RepeatRule {
  const text = presetRule(name, start);
  if (text === null) throw new Error(`${name} made no rule`);
  return rule(text);
}

describe("C1: each preset from a start date is one rule that hits Google's dates", () => {
  // Sunday 18 October 2026, the third Sunday (repeats-menu.md).
  const start = "2026-10-18";
  const monthEnd = "2026-11-17";

  it("stores one rule per preset, two lines, and none for Does not repeat", () => {
    expect(presetRule("none", start)).toBeNull();
    expect(presetRule("daily", start)).toBe(
      "DTSTART;VALUE=DATE:20261018\nRRULE:FREQ=DAILY",
    );
    expect(presetRule("weekly", start)).toBe(
      "DTSTART;VALUE=DATE:20261018\nRRULE:FREQ=WEEKLY;BYDAY=SU",
    );
    expect(presetRule("monthly", start)).toBe(
      "DTSTART;VALUE=DATE:20261018\nRRULE:FREQ=MONTHLY;BYDAY=3SU",
    );
    expect(presetRule("annually", start)).toBe(
      "DTSTART;VALUE=DATE:20261018\nRRULE:FREQ=YEARLY",
    );
    expect(presetRule("weekdays", start)).toBe(
      "DTSTART;VALUE=DATE:20261018\nRRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
    );
  });

  it("Daily hits every date", () => {
    const hits = occurrences(preset("daily", start), start, monthEnd);
    expect(hits).toHaveLength(31);
    expect(hits[0]).toBe("2026-10-18");
    expect(hits.at(-1)).toBe("2026-11-17");
  });

  it("Weekly on Sunday hits the Sundays", () => {
    expect(occurrences(preset("weekly", start), start, monthEnd)).toEqual([
      "2026-10-18",
      "2026-10-25",
      "2026-11-01",
      "2026-11-08",
      "2026-11-15",
    ]);
  });

  it("Monthly on the third Sunday hits the third Sundays", () => {
    expect(occurrences(preset("monthly", start), start, "2026-12-31")).toEqual([
      "2026-10-18",
      "2026-11-15",
      "2026-12-20",
    ]);
  });

  it("Monthly from a fifth weekday is the last one", () => {
    // Thursday 29 October 2026 is the fifth Thursday.
    expect(presetRule("monthly", "2026-10-29")).toContain("BYDAY=-1TH");
    expect(
      occurrences(preset("monthly", "2026-10-29"), "2026-10-29", "2026-12-31"),
    ).toEqual(["2026-10-29", "2026-11-26", "2026-12-31"]);
  });

  it("Annually on 18 October hits it once a year", () => {
    expect(occurrences(preset("annually", start), start, monthEnd)).toEqual([
      "2026-10-18",
    ]);
    expect(occurrences(preset("annually", start), start, "2028-12-31")).toEqual(
      ["2026-10-18", "2027-10-18", "2028-10-18"],
    );
  });

  it("Every weekday hits Monday to Friday, not the Sunday it starts on", () => {
    expect(occurrences(preset("weekdays", start), start, monthEnd)).toEqual([
      "2026-10-19",
      "2026-10-20",
      "2026-10-21",
      "2026-10-22",
      "2026-10-23",
      "2026-10-26",
      "2026-10-27",
      "2026-10-28",
      "2026-10-29",
      "2026-10-30",
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
      "2026-11-09",
      "2026-11-10",
      "2026-11-11",
      "2026-11-12",
      "2026-11-13",
      "2026-11-16",
      "2026-11-17",
    ]);
  });
});

describe("C2: custom rules expand right", () => {
  it("every N days", () => {
    expect(
      occurrences(
        from("2026-10-18", "FREQ=DAILY;INTERVAL=3"),
        "2026-10-18",
        "2026-10-31",
      ),
    ).toEqual([
      "2026-10-18",
      "2026-10-21",
      "2026-10-24",
      "2026-10-27",
      "2026-10-30",
    ]);
  });

  it("every 2 weeks on several weekdays", () => {
    expect(
      occurrences(
        from("2026-10-19", "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE"),
        "2026-10-19",
        "2026-11-20",
      ),
    ).toEqual([
      "2026-10-19",
      "2026-10-21",
      "2026-11-02",
      "2026-11-04",
      "2026-11-16",
      "2026-11-18",
    ]);
  });

  it("interval weeks honour WKST", () => {
    const body = "FREQ=WEEKLY;INTERVAL=2;BYDAY=SU,MO";
    // Weeks from Monday: Sunday 18 October ends the start's week.
    expect(
      occurrences(from("2026-10-18", body), "2026-10-18", "2026-11-16"),
    ).toEqual([
      "2026-10-18",
      "2026-10-26",
      "2026-11-01",
      "2026-11-09",
      "2026-11-15",
    ]);
    // Weeks from Sunday: it opens it.
    expect(
      occurrences(
        from("2026-10-18", `${body};WKST=SU`),
        "2026-10-18",
        "2026-11-16",
      ),
    ).toEqual([
      "2026-10-18",
      "2026-10-19",
      "2026-11-01",
      "2026-11-02",
      "2026-11-15",
      "2026-11-16",
    ]);
  });

  it("every 2 months on a day", () => {
    expect(
      occurrences(
        from("2026-10-18", "FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=18"),
        "2026-10-01",
        "2027-03-31",
      ),
    ).toEqual(["2026-10-18", "2026-12-18", "2027-02-18"]);
  });

  it("monthly on an nth weekday", () => {
    expect(
      occurrences(
        from("2026-10-13", "FREQ=MONTHLY;BYDAY=2TU"),
        "2026-10-01",
        "2026-12-31",
      ),
    ).toEqual(["2026-10-13", "2026-11-10", "2026-12-08"]);
  });

  it("monthly on the last weekday", () => {
    expect(
      occurrences(
        from("2026-10-30", "FREQ=MONTHLY;BYDAY=-1FR"),
        "2026-10-01",
        "2026-12-31",
      ),
    ).toEqual(["2026-10-30", "2026-11-27", "2026-12-25"]);
  });

  it("every 2 years", () => {
    expect(
      occurrences(
        from("2026-10-18", "FREQ=YEARLY;INTERVAL=2"),
        "2026-01-01",
        "2031-12-31",
      ),
    ).toEqual(["2026-10-18", "2028-10-18", "2030-10-18"]);
  });

  it("ends on an UNTIL date, inclusive, as a date or a UTC date-time", () => {
    for (const until of ["20261101", "20261101T235959Z"]) {
      const weekly = from("2026-10-18", `FREQ=WEEKLY;BYDAY=SU;UNTIL=${until}`);
      expect(occurrences(weekly, "2026-10-01", "2026-12-31")).toEqual([
        "2026-10-18",
        "2026-10-25",
        "2026-11-01",
      ]);
      expect(occursOn(weekly, "2026-11-01")).toBe(true);
      expect(occursOn(weekly, "2026-11-08")).toBe(false);
    }
  });

  it("ends after COUNT dates, counted from the start", () => {
    const weekly = from("2026-10-18", "FREQ=WEEKLY;BYDAY=SU;COUNT=3");
    expect(occurrences(weekly, "2026-10-01", "2026-12-31")).toEqual([
      "2026-10-18",
      "2026-10-25",
      "2026-11-01",
    ]);
    // A window that opens after the start still counts from the start.
    expect(occurrences(weekly, "2026-10-25", "2026-12-31")).toEqual([
      "2026-10-25",
      "2026-11-01",
    ]);
    expect(occursOn(weekly, "2026-11-01")).toBe(true);
    expect(occursOn(weekly, "2026-11-08")).toBe(false);
  });

  it("COUNT counts real hits only, not a start off its own pattern", () => {
    const weekdays = from(
      "2026-10-18",
      "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;COUNT=2",
    );
    expect(occursOn(weekdays, "2026-10-18")).toBe(false);
    expect(occurrences(weekdays, "2026-10-01", "2026-12-31")).toEqual([
      "2026-10-19",
      "2026-10-20",
    ]);
  });
});

describe("C3: month ends, leap days, fifth weekdays and the start", () => {
  it("monthly on day 31 skips shorter months", () => {
    expect(
      occurrences(
        from("2027-01-31", "FREQ=MONTHLY"),
        "2027-01-01",
        "2027-07-31",
      ),
    ).toEqual(["2027-01-31", "2027-03-31", "2027-05-31", "2027-07-31"]);
  });

  it("annually on 29 February hits only leap years", () => {
    const leap = preset("annually", "2028-02-29");
    expect(occurrences(leap, "2028-01-01", "2036-12-31")).toEqual([
      "2028-02-29",
      "2032-02-29",
      "2036-02-29",
    ]);
    expect(occursOn(leap, "2029-02-28")).toBe(false);
    expect(occursOn(leap, "2029-03-01")).toBe(false);
  });

  it("a fifth weekday skips months without one", () => {
    expect(
      occurrences(
        from("2026-10-29", "FREQ=MONTHLY;BYDAY=5TH"),
        "2026-10-01",
        "2027-04-30",
      ),
    ).toEqual(["2026-10-29", "2026-12-31", "2027-04-29"]);
  });

  it("no date falls before the start", () => {
    const weekly = preset("weekly", "2026-10-18");
    expect(occurrences(weekly, "2026-09-01", "2026-10-25")).toEqual([
      "2026-10-18",
      "2026-10-25",
    ]);
    expect(occursOn(weekly, "2026-10-11")).toBe(false);

    const fifth = from("2026-10-18", "FREQ=MONTHLY;BYMONTHDAY=5");
    expect(occurrences(fifth, "2026-10-01", "2026-11-30")).toEqual([
      "2026-11-05",
    ]);
  });

  it("a window that ends before it opens is empty", () => {
    expect(
      occurrences(preset("daily", "2026-10-18"), "2026-10-20", "2026-10-19"),
    ).toEqual([]);
  });
});

describe("C4: parseRule refuses what it cannot run, with a reason", () => {
  const start = "DTSTART;VALUE=DATE:20261018";

  it.each([
    ["an unknown FREQ", `${start}\nRRULE:FREQ=HOURLY`, "FREQ=HOURLY"],
    [
      "BYSETPOS",
      `${start}\nRRULE:FREQ=MONTHLY;BYDAY=SU;BYSETPOS=-1`,
      "BYSETPOS",
    ],
    ["BYHOUR", `${start}\nRRULE:FREQ=DAILY;BYHOUR=9`, "BYHOUR"],
    ["a missing DTSTART", "RRULE:FREQ=WEEKLY;BYDAY=SU", "DTSTART"],
    ["a part with no value", `${start}\nRRULE:FREQ=WEEKLY;BYDAY`, "BYDAY"],
    ["a part named twice", `${start}\nRRULE:FREQ=WEEKLY;FREQ=DAILY`, "FREQ"],
    ["no FREQ", `${start}\nRRULE:BYDAY=SU`, "FREQ"],
    [
      "a date that does not exist",
      "DTSTART;VALUE=DATE:20260230\nRRULE:FREQ=DAILY",
      "DTSTART",
    ],
    ["text that is not a rule", "every Sunday", "DTSTART"],
    [
      "UNTIL and COUNT together",
      `${start}\nRRULE:FREQ=DAILY;COUNT=2;UNTIL=20261101`,
      "UNTIL",
    ],
    [
      "an ordinal on a weekly day",
      `${start}\nRRULE:FREQ=WEEKLY;BYDAY=3SU`,
      "BYDAY",
    ],
    [
      "a monthly weekday with no nth",
      `${start}\nRRULE:FREQ=MONTHLY;BYDAY=SU`,
      "BYDAY",
    ],
    ["INTERVAL=0", `${start}\nRRULE:FREQ=DAILY;INTERVAL=0`, "INTERVAL"],
    [
      "30 February",
      `${start}\nRRULE:FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=30`,
      "month",
    ],
  ])("refuses %s", (_, text, mention) => {
    const parsed = parseRule(text);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.reason).toContain(mention);
  });

  it("reads CRLF lines, as RFC 5545 writes them", () => {
    expect(parseRule(`${start}\r\nRRULE:FREQ=WEEKLY;BYDAY=SU`).ok).toBe(true);
  });
});
