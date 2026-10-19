import { describe, expect, it } from "vitest";
import { occurrences, parseRule, presetRule, type RepeatRule } from "./rrule";
import {
  buildRule,
  defaultRuleForm,
  describeRule,
  ruleForm,
  splitRule,
  type RuleForm,
} from "./rule-words";

/** Parse or fail the test with the reason. */
function read(text: string): RepeatRule {
  const parsed = parseRule(text);
  if (!parsed.ok) throw new Error(parsed.reason);
  return parsed.rule;
}

// Sunday reset's start: Sunday 18 October 2026, the third Sunday.
const SUNDAY = "2026-10-18";

const form = (change: Partial<RuleForm>): RuleForm => ({
  every: 1,
  unit: "week",
  weekdays: [6],
  monthBy: null,
  ends: { kind: "never" },
  ...change,
});

describe("buildRule (C3)", () => {
  it("every week on Wednesday and Sunday is one rule, not one per weekday", () => {
    const text = buildRule(form({ weekdays: [6, 2] }), SUNDAY);
    expect(text).toBe(
      "DTSTART;VALUE=DATE:20261018\nRRULE:FREQ=WEEKLY;BYDAY=WE,SU",
    );
    expect(text.match(/RRULE:/g)).toHaveLength(1);
    const rule = read(text);
    expect(occurrences(rule, SUNDAY, "2026-10-31")).toEqual([
      "2026-10-18",
      "2026-10-21",
      "2026-10-25",
      "2026-10-28",
    ]);
    expect(describeRule(rule)).toBe("Weekly on Wednesday and Sunday");
  });

  it("monthly on day 18, or on the third Sunday", () => {
    const byDay = read(
      buildRule(form({ unit: "month", monthBy: "day" }), SUNDAY),
    );
    expect(occurrences(byDay, SUNDAY, "2026-12-31")).toEqual([
      "2026-10-18",
      "2026-11-18",
      "2026-12-18",
    ]);
    expect(describeRule(byDay)).toBe("Monthly on day 18");

    const byNth = read(
      buildRule(form({ unit: "month", monthBy: "nth" }), SUNDAY),
    );
    expect(occurrences(byNth, SUNDAY, "2026-12-31")).toEqual([
      "2026-10-18",
      "2026-11-15",
      "2026-12-20",
    ]);
    expect(describeRule(byNth)).toBe("Monthly on the third Sunday");
  });

  it("ends on a date, or after 13 times", () => {
    const until = read(
      buildRule(form({ ends: { kind: "on", date: "2027-01-18" } }), SUNDAY),
    );
    expect(until.until).toBe("2027-01-18");
    expect(occurrences(until, SUNDAY, "2027-12-31").at(-1)).toBe("2027-01-17");
    expect(describeRule(until)).toBe("Weekly on Sunday, until 18 January 2027");

    const after = read(
      buildRule(
        form({ weekdays: [2, 6], ends: { kind: "after", count: 13 } }),
        SUNDAY,
      ),
    );
    expect(after.count).toBe(13);
    expect(occurrences(after, SUNDAY, "2027-12-31")).toHaveLength(13);
    expect(describeRule(after)).toBe(
      "Weekly on Wednesday and Sunday, 13 times",
    );
  });

  it("every N days, weeks and years", () => {
    const days = read(buildRule(form({ unit: "day", every: 3 }), SUNDAY));
    expect(occurrences(days, SUNDAY, "2026-10-24")).toEqual([
      "2026-10-18",
      "2026-10-21",
      "2026-10-24",
    ]);
    expect(describeRule(days)).toBe("Every 3 days");
    expect(describeRule(read(buildRule(form({ every: 2 }), SUNDAY)))).toBe(
      "Every 2 weeks on Sunday",
    );
    const years = read(buildRule(form({ unit: "year", every: 2 }), SUNDAY));
    expect(occurrences(years, SUNDAY, "2030-12-31")).toEqual([
      "2026-10-18",
      "2028-10-18",
      "2030-10-18",
    ]);
    expect(describeRule(years)).toBe("Every 2 years on 18 October");
  });

  it("a custom rule that is a preset is the preset's own text and words", () => {
    expect(buildRule(form({}), SUNDAY)).toBe(presetRule("weekly", SUNDAY));
    expect(buildRule(form({ unit: "day" }), SUNDAY)).toBe(
      presetRule("daily", SUNDAY),
    );
    expect(buildRule(form({ unit: "month", monthBy: "nth" }), SUNDAY)).toBe(
      presetRule("monthly", SUNDAY),
    );
    expect(buildRule(form({ unit: "year" }), SUNDAY)).toBe(
      presetRule("annually", SUNDAY),
    );
    const workweek = form({ weekdays: [0, 1, 2, 3, 4] });
    expect(buildRule(workweek, SUNDAY)).toBe(presetRule("weekdays", SUNDAY));
    expect(describeRule(read(buildRule(workweek, SUNDAY)))).toBe(
      "Every weekday, Monday to Friday",
    );
    expect(describeRule(read(presetRule("annually", SUNDAY)!))).toBe(
      "Annually on 18 October",
    );
  });

  it("reads back to the step's choices", () => {
    const choices = form({
      weekdays: [2, 6],
      ends: { kind: "after", count: 13 },
    });
    expect(ruleForm(read(buildRule(choices, SUNDAY)))).toEqual(choices);
    expect(defaultRuleForm(SUNDAY)).toEqual(form({}));
  });

  it("the fifth Thursday words as the last", () => {
    const rule = read(
      buildRule(form({ unit: "month", monthBy: "nth" }), "2026-10-29"),
    );
    expect(describeRule(rule)).toBe("Monthly on the last Thursday");
  });
});

describe("splitRule (This and following)", () => {
  const FROM = "2026-10-15";

  /** Every date of the two halves together equals the whole, each once. */
  function expectSameDates(whole: string, from: string, to = "2027-06-30") {
    const split = splitRule(whole, from);
    if (!split.ok) throw new Error(split.reason);
    const all = occurrences(read(whole), "2026-01-01", to);
    const before = split.before
      ? occurrences(read(split.before), "2026-01-01", to)
      : [];
    const after = occurrences(read(split.after), "2026-01-01", to);
    expect(before.every((d) => d < from)).toBe(true);
    expect(after.every((d) => d >= from)).toBe(true);
    expect([...before, ...after]).toEqual(all);
    return split;
  }

  it("ends the old rule the day before and starts the new on the date", () => {
    const whole = "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=WEEKLY;BYDAY=TU,TH";
    const split = expectSameDates(whole, FROM);
    expect(split.ok && split.before).toBe(
      "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=WEEKLY;BYDAY=TU,TH;UNTIL=20261014",
    );
    expect(split.ok && split.after).toBe(
      "DTSTART;VALUE=DATE:20261015\nRRULE:FREQ=WEEKLY;BYDAY=TU,TH",
    );
  });

  it("recounts COUNT across the two", () => {
    const whole =
      "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=WEEKLY;BYDAY=TU,TH;COUNT=9";
    const split = expectSameDates(whole, FROM);
    expect(split.ok && split.before).toMatch(/COUNT=4$/);
    expect(split.ok && split.after).toMatch(/COUNT=5$/);
  });

  it("keeps an UNTIL on the new rule, and every-other-week stays in step", () => {
    expectSameDates(
      "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=TH;UNTIL=20270301",
      FROM,
    );
    expectSameDates(
      "DTSTART;VALUE=DATE:20260115\nRRULE:FREQ=MONTHLY;BYDAY=3TH",
      FROM,
    );
    expectSameDates(
      "DTSTART;VALUE=DATE:20261003\nRRULE:FREQ=DAILY;INTERVAL=3",
      FROM,
    );
  });

  it("from the first date there is no old rule", () => {
    const split = splitRule(
      "DTSTART;VALUE=DATE:20261015\nRRULE:FREQ=WEEKLY;BYDAY=TH",
      FROM,
    );
    expect(split).toMatchObject({ ok: true, before: null });
  });

  it("refuses a date the rule does not run on", () => {
    expect(
      splitRule(
        "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=WEEKLY;BYDAY=MO",
        FROM,
      ),
    ).toMatchObject({ ok: false });
  });
});
