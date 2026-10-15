import { describe, expect, it } from "vitest";
import { resolveDayEntry } from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { onNowDay } from "@/lib/fixtures/scenarios/now-day";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { deriveReviewDay } from "./use-review-day";

/** A server on Review the day's Monday with a clock the test moves. */
function setup(name = "review-success") {
  let nowMs = Date.parse(onNowDay("06:58"));
  const server = createFixtureServer(
    resolveScenario(name),
    () => new Date(nowMs),
  );
  return {
    server,
    at: () => new Date(nowMs).toISOString(),
    advance(minutes: number) {
      nowMs += minutes * 60_000;
    },
    async view() {
      return deriveReviewDay(deriveToday(await server.readToday(BASE_DATE)));
    },
  };
}

describe("C6: Ready, go writes readyAt once, then the day goes to the welcome", () => {
  it("writes the first press and keeps it on a second", async () => {
    const { server, at, advance, view } = setup();
    const before = await server.readToday(BASE_DATE);
    expect(before.dayRecord?.readyAt).toBeNull();
    expect(
      resolveDayEntry({ dayRecord: before.dayRecord, startedOnDevice: false }),
    ).toBe("review");

    const first = at();
    const record = await server.readyGo(BASE_DATE, first);
    expect(record.readyAt).toBe(first);

    advance(3);
    const again = await server.readyGo(BASE_DATE, at());
    expect(again.readyAt).toBe(first);

    const after = await server.readToday(BASE_DATE);
    expect(after.dayRecord?.readyAt).toBe(first);
    expect(after.dayRecord?.orientedAt).toBe(before.dayRecord?.orientedAt);
    expect(
      resolveDayEntry({ dayRecord: after.dayRecord, startedOnDevice: false }),
    ).toBe("welcome");
    expect((await view()).readied).toBe(true);
  });
});

describe("Review the day's column from the Monday", () => {
  it("runs 7 to 15 with Orient's five minutes at Up at", async () => {
    const view = await setup().view();
    expect(view.startMin).toBe(7 * 60);
    expect(view.endMin).toBe(15 * 60);
    expect(view.orient).toEqual({ atMin: 7 * 60, lengthMin: 5 });
    expect(view.readied).toBe(false);
  });

  it("draws every block in order, meals and Work by their form", async () => {
    const { blocks } = await setup().view();
    expect(blocks.map((b) => [b.name, b.startsAt, b.endsAt, b.form])).toEqual([
      ["Wellness", "07:05", "08:00", "items"],
      ["Training", "08:00", "08:57", "items"],
      ["Breakfast", "09:00", "09:30", "meal"],
      ["Work", "09:30", "12:00", "work"],
      ["Lunch", "12:00", "13:00", "meal"],
      ["Work", "13:00", "15:00", "work"],
    ]);
  });

  it("keeps a block's items in order, the drives as transitions", async () => {
    const { blocks } = await setup().view();
    expect(blocks[0]!.items.map((item) => item.label)).toEqual([
      "Pee and weigh",
      "Water",
      "Start the cold bath",
      "Meditate",
      "Cold bath",
    ]);
    expect(blocks[1]!.items.map((item) => [item.label, item.tone])).toEqual([
      ["Drive to the YMCA", "transition"],
      ["Workout: gym", "dot"],
      ["Drive home", "transition"],
    ]);
  });

  it("puts Work's slots under their tiers, the Linear id beside the title", async () => {
    const { blocks } = await setup().view();
    const work = blocks[3]!;
    expect(
      work.tiers.map((t) => [t.tier, t.items.map((i) => i.label)]),
    ).toEqual([
      ["primary", ["[Primary item, linked] · ENG-123", "[Primary item]"]],
      ["secondary", ["[Secondary item]"]],
    ]);
    expect(blocks[5]!.tiers).toEqual([]);
  });
});
