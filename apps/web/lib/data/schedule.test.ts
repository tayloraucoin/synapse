import { describe, expect, it } from "vitest";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { onNowDay } from "@/lib/fixtures/scenarios/now-day";
import { onSunday, SUNDAY_DATE } from "@/lib/fixtures/scenarios/now-forms";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { deriveSchedule, scheduleNow } from "./use-schedule";

/** A server on a Schedule scenario, read at `at`. */
async function read(name: string, at: string, dateKey = BASE_DATE) {
  const now = new Date(at);
  const server = createFixtureServer(resolveScenario(name), () => now);
  const today = deriveToday(await server.readToday(dateKey));
  return { today, view: deriveSchedule(today, now), server };
}

const settle = <T>(promise: Promise<T>) =>
  Promise.race([
    promise.then(
      () => "ok" as const,
      () => "error" as const,
    ),
    new Promise<"waiting">((resolve) =>
      setTimeout(() => resolve("waiting"), 20),
    ),
  ]);

describe("C7: the minute moves the now line and nothing else", () => {
  it("changes only the line between 10:20 and 10:21", async () => {
    const { today } = await read("checks-and-running", onNowDay("10:20"));
    const at20 = new Date(onNowDay("10:20"));
    const at21 = new Date(onNowDay("10:21"));
    expect(deriveSchedule(today, at21)).toEqual(deriveSchedule(today, at20));
    expect(scheduleNow(at20, today.records.timeZone)).toEqual({
      atMin: 620,
      label: "10:20",
    });
    expect(scheduleNow(at21, today.records.timeZone).label).toBe("10:21");
  });
});

describe("C7: before Ready, go no block has the edge", () => {
  it("draws the same column with no edge", async () => {
    const { today } = await read("review-success", onNowDay("10:20"));
    const view = deriveSchedule(today, new Date(onNowDay("10:20")));
    expect(view.phase).toBe("before-go");
    expect(view.blocks.some((block) => block.state === "now")).toBe(false);
    expect(view.blocks.map((block) => block.name)).toContain("Work");
  });
});

describe("C7: with the to-dos failing the day still settles", () => {
  it("reads the day while the to-dos fail on their own", async () => {
    const now = new Date(onNowDay("10:20"));
    const server = createFixtureServer(
      resolveScenario("schedule-partial"),
      () => now,
    );
    expect(await settle(server.readTodos(BASE_DATE))).toBe("error");
    expect(await settle(server.readToday(BASE_DATE))).toBe("ok");
    const view = deriveSchedule(
      deriveToday(await server.readToday(BASE_DATE)),
      now,
    );
    expect(view.blocks.length).toBeGreaterThan(0);
  });
});

describe("Schedule during go, from the Monday at 10:20", () => {
  it("fades what has passed and edges Work alone", async () => {
    const { view } = await read("during-go", onNowDay("10:20"));
    expect(
      view.blocks.map((block) => [block.name, block.startsAt, block.state]),
    ).toEqual([
      ["Wellness", "07:05", "done"],
      ["Training", "08:00", "done"],
      ["Breakfast", "09:00", "done"],
      ["Work", "09:30", "now"],
      ["Lunch", "12:00", null],
      ["Work", "13:00", null],
    ]);
    expect(view.startMin).toBe(7 * 60);
    expect(view.endMin).toBe(15 * 60);
    expect(view.allDay).toBeNull();
  });

  it("marks checks, the running item and planned dots", async () => {
    const { view } = await read("checks-and-running", onNowDay("10:20"));
    const [wellness] = view.blocks;
    expect(wellness!.items.slice(0, 4).map((item) => item.mark)).toEqual([
      "done",
      "done",
      "done",
      "planned",
    ]);
    const work = view.blocks.find((block) => block.state === "now")!;
    expect(
      work.tiers.map(({ tier, items }) => [
        tier,
        items.map((item) => [item.label, item.mark]),
      ]),
    ).toEqual([
      [
        "primary",
        [
          ["[Write the sync spec] · ENG-123", "done"],
          ["[Review the Paper handoff]", "running"],
        ],
      ],
      ["secondary", [["[Answer the review comments]", "planned"]]],
    ]);
  });

  it("draws a meeting as one band of Work, Primary above and Secondary below", async () => {
    const { view } = await read("meeting-inside-a-block", onNowDay("10:20"));
    const works = view.blocks.filter((block) => block.name === "Work");
    expect(works).toHaveLength(2);
    const [work] = works;
    expect(work!.bands.map((band) => [band.title, band.startsAt])).toEqual([
      ["[Design sync]", "10:30"],
    ]);
    expect(
      work!.segments!.map((segment) => segment.tiers.map((tier) => tier.tier)),
    ).toEqual([["primary"], ["secondary"]]);
    expect(view.events).toEqual([]);
    expect(work!.state).toBe("now");
  });
});

describe("Schedule on the checklist day, Sunday at 11:20", () => {
  it("puts the checklist in the strip with its edge, Lunch with Sam on its own", async () => {
    const { view } = await read(
      "checklist-day",
      onSunday("11:20"),
      SUNDAY_DATE,
    );
    expect(view.allDay).toEqual({
      id: expect.any(String),
      name: "Sunday",
      rows: [
        { id: expect.any(String), label: "Groceries", checked: false },
        { id: expect.any(String), label: "Laundry", checked: false },
        { id: expect.any(String), label: "Water the plants", checked: false },
        { id: expect.any(String), label: "Meal prep", checked: true },
      ],
      underWay: true,
    });
    expect(view.blocks).toEqual([]);
    expect(
      view.events.map((event) => [event.title, event.startsAt, event.tag]),
    ).toEqual([["Lunch with Sam", "13:00", "personal"]]);
    expect(view.events[0]!.underWay).toBe(false);
  });

  it("moves the edge to Lunch with Sam while it is under way", async () => {
    const { today } = await read(
      "checklist-day",
      onSunday("11:20"),
      SUNDAY_DATE,
    );
    const view = deriveSchedule(today, new Date(onSunday("13:30")));
    expect(view.allDay!.underWay).toBe(false);
    expect(view.events[0]!.underWay).toBe(true);
  });
});
