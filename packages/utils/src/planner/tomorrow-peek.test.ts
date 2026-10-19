import { describe, expect, it } from "vitest";
import { tomorrowPeek } from "./tomorrow-peek";

const at = (name: string, startsAt: string) => ({ block: { name }, startsAt });

describe("C4: tomorrowPeek", () => {
  it("names the first two blocks and the first's start", () => {
    expect(
      tomorrowPeek([
        at("Wellness", "07:05"),
        at("Training", "08:00"),
        at("Breakfast", "09:00"),
      ]),
    ).toEqual({
      first: { name: "Wellness", startsAt: "07:05" },
      second: { name: "Training" },
    });
  });

  it("reads them in start order, whatever order they come in", () => {
    expect(
      tomorrowPeek([at("Work", "09:30"), at("Wellness", "07:05")]),
    ).toEqual({
      first: { name: "Wellness", startsAt: "07:05" },
      second: { name: "Work" },
    });
  });

  it("names one block alone when the day has one", () => {
    expect(tomorrowPeek([at("Wellness", "07:05")])).toEqual({
      first: { name: "Wellness", startsAt: "07:05" },
    });
  });

  it("returns nothing for a day with no blocks", () => {
    expect(tomorrowPeek([])).toBeNull();
  });
});
