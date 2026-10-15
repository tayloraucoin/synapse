import { describe, expect, it } from "vitest";
import {
  nextDue,
  nextTodoDue,
  ordinal,
  ruleBody,
  ruleStart,
  todoRepeatOptions,
} from "./todo-repeat";

describe("todoRepeatOptions (C6)", () => {
  it("gives the four rules for Monday 12 October with their labels", () => {
    expect(todoRepeatOptions("2026-10-12")).toEqual([
      { label: "Does not repeat", rrule: null },
      {
        label: "Every day",
        rrule: "DTSTART;VALUE=DATE:20261012\nRRULE:FREQ=DAILY",
      },
      {
        label: "Every week, on Monday",
        rrule: "DTSTART;VALUE=DATE:20261012\nRRULE:FREQ=WEEKLY;BYDAY=MO",
      },
      {
        label: "Every month, on the 12th",
        rrule: "DTSTART;VALUE=DATE:20261012\nRRULE:FREQ=MONTHLY;BYMONTHDAY=12",
      },
    ]);
  });

  it("names the weekday and date of the day it reads from", () => {
    const labels = todoRepeatOptions("2026-10-01").map((o) => o.label);
    expect(labels[2]).toBe("Every week, on Thursday");
    expect(labels[3]).toBe("Every month, on the 1st");
    expect(todoRepeatOptions("2026-10-22")[3]?.label).toBe(
      "Every month, on the 22nd",
    );
  });

  it("writes ordinals as people read them", () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 23, 31].map(ordinal)).toEqual([
      "1st",
      "2nd",
      "3rd",
      "4th",
      "11th",
      "12th",
      "13th",
      "21st",
      "23rd",
      "31st",
    ]);
  });
});

describe("nextDue", () => {
  const [, daily, weekly, monthly] = todoRepeatOptions("2026-10-12").map(
    (o) => o.rrule ?? "",
  );

  it("finds the next date each rule hits", () => {
    expect(nextDue(daily!, "2026-10-12")).toBe("2026-10-13");
    expect(nextDue(weekly!, "2026-10-12")).toBe("2026-10-19");
    expect(nextDue(monthly!, "2026-10-12")).toBe("2026-11-12");
  });

  it("is null for a rule it cannot read", () => {
    expect(nextDue("RRULE:FREQ=HOURLY", "2026-10-12")).toBeNull();
  });

  it("counts from the to-do's own day when that is later than the check", () => {
    expect(
      nextTodoDue({
        rrule: weekly!,
        onDate: "2026-10-19",
        checkedOn: "2026-10-18",
      }),
    ).toBe("2026-10-26");
    expect(
      nextTodoDue({ rrule: weekly!, onDate: null, checkedOn: "2026-10-12" }),
    ).toBe("2026-10-19");
  });
});

describe("ruleBody and ruleStart", () => {
  it("read the RRULE line and the start apart", () => {
    const text = "DTSTART;VALUE=DATE:20261012\nRRULE:FREQ=WEEKLY;BYDAY=MO";
    expect(ruleBody(text)).toBe("RRULE:FREQ=WEEKLY;BYDAY=MO");
    expect(ruleStart(text)).toBe("2026-10-12");
  });
});
