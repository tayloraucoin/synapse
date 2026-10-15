import { describe, expect, it } from "vitest";
import {
  formatCountdown,
  overBand,
  runningBand,
  tookMinutes,
} from "./over-band";

const MIN = 60_000;
const SEC = 1000;

describe("C6: overBand, Done's percent bands", () => {
  it("for 30 min: ink at 33, warning at 34 and 37, danger at 38 and 41", () => {
    expect(overBand(30, 33)).toBe("ink");
    expect(overBand(30, 34)).toBe("warning");
    expect(overBand(30, 37)).toBe("warning");
    expect(overBand(30, 38)).toBe("danger");
    expect(overBand(30, 41)).toBe("danger");
  });

  it("for 10 min: ink at 9 and 11, warning at 12, danger at 13", () => {
    expect(overBand(10, 9)).toBe("ink");
    expect(overBand(10, 11)).toBe("ink");
    expect(overBand(10, 12)).toBe("warning");
    expect(overBand(10, 13)).toBe("danger");
  });

  it("for 45 min: ink at 46, not danger a minute over", () => {
    expect(overBand(45, 46)).toBe("ink");
  });

  it("an edge is at least 1 min: a 2-min item is ink a minute over", () => {
    expect(overBand(2, 3)).toBe("ink");
    expect(overBand(2, 4)).toBe("danger");
  });

  it("under the plan is always ink", () => {
    expect(overBand(10, 0)).toBe("ink");
    expect(overBand(30, 29)).toBe("ink");
  });

  it("running reads whole minutes worked: 10:40 on a 10-min item is ink", () => {
    expect(runningBand(10, 10 * MIN + 40 * SEC)).toBe("ink");
    expect(runningBand(10, 12 * MIN)).toBe("warning");
    expect(runningBand(10, 13 * MIN)).toBe("danger");
  });
});

describe("C6: formatCountdown", () => {
  it('counts down: 2:18 into 10 min reads "7:42"', () => {
    expect(formatCountdown(10 * MIN, 2 * MIN + 18 * SEC)).toEqual({
      text: "7:42",
      figure: "7:42",
      over: false,
    });
  });

  it("reads the whole plan the moment it starts", () => {
    expect(formatCountdown(10 * MIN, 400).text).toBe("10:00");
  });

  it('under a minute over reads "0:40 over"', () => {
    expect(formatCountdown(10 * MIN, 10 * MIN + 40 * SEC)).toEqual({
      text: "0:40 over",
      figure: "0:40",
      over: true,
    });
  });

  it('from a minute over reads whole minutes, "3 min over"', () => {
    expect(formatCountdown(10 * MIN, 13 * MIN + 20 * SEC)).toEqual({
      text: "3 min over",
      figure: "3 min",
      over: true,
    });
  });

  it("an hour or more left keeps the hours", () => {
    expect(formatCountdown(90 * MIN, 5 * MIN + 50 * SEC).text).toBe("1:24:10");
  });
});

describe("tookMinutes", () => {
  it("rounds work time to the nearest minute, at least 1", () => {
    expect(tookMinutes(5 * MIN + 50 * SEC)).toBe(6);
    expect(tookMinutes(12 * MIN + 20 * SEC)).toBe(12);
    expect(tookMinutes(10 * SEC)).toBe(1);
  });
});
