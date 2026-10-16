import { describe, expect, it } from "vitest";
import type { IconValue } from "@syn/types";
import { addDays, weekdayIndex, weekKeyOf } from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { NOW_IDS, onNowDay } from "@/lib/fixtures/scenarios/now-day";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { deriveBlockView } from "./use-block-view";
import { deriveReviewDay } from "./use-review-day";
import { deriveSchedule } from "./use-schedule";
import { colourOfIcon, todayLookInput } from "./use-today-block-look";

/**
 * Today's own look for a block (USE-88): the date's `block_changes` name,
 * icon and colour, read through `readDay` by every surface of the day, and
 * never the usual block's.
 */

const W = NOW_IDS.blocks.wellness;
const NEXT_WEEK = addDays(BASE_DATE, 7);
const LEAF: IconValue = { kind: "lucide", value: "leaf", color: "sage" };

function setup() {
  const now = new Date(Date.parse(onNowDay("07:01")));
  const server = createFixtureServer(
    resolveScenario("block-view-success"),
    () => now,
  );
  async function today(date = BASE_DATE) {
    return deriveToday(await server.readToday(date));
  }
  async function wellness(date = BASE_DATE) {
    const day = await today(date);
    const occurrence = day.occurrences.blocks.find((o) => o.block.id === W);
    if (!occurrence) throw new Error("Wellness is not on the date.");
    return occurrence;
  }
  async function writeLook(next: { name?: string; icon?: IconValue }) {
    const { startsAt, endsAt } = await wellness();
    return server.writeBlockChange(
      todayLookInput({ blockId: W, date: BASE_DATE, startsAt, endsAt }, next),
    );
  }
  return { server, now, today, wellness, writeLook };
}

describe("a rename from the day (C1)", () => {
  it("writes the date's change; the usual block and next week keep the name", async () => {
    const { server, wellness, writeLook } = setup();
    const before = await wellness();
    await writeLook({ name: "Slow morning" });

    expect((await wellness()).block.name).toBe("Slow morning");
    // The occurrence's own times were carried, so nothing moved.
    expect((await wellness()).changed).toBe(false);
    expect((await wellness()).startsAt).toBe(before.startsAt);

    const usual = deriveBlockView(
      await server.readWeek("usual"),
      W,
      weekdayIndex(BASE_DATE),
    );
    expect(usual?.block.block.name).toBe("Wellness");
    expect((await wellness(NEXT_WEEK)).block.name).toBe("Wellness");
  });

  it("reads in the week's read for the date (Block view's rows)", async () => {
    const { server, writeLook } = setup();
    await writeLook({ name: "Slow morning" });
    const view = deriveBlockView(
      await server.readWeek(weekKeyOf(BASE_DATE)),
      W,
      weekdayIndex(BASE_DATE),
    );
    expect(view?.block.block.name).toBe("Slow morning");
  });

  it("keeps a move made for the date, and the move keeps the name", async () => {
    const { server, wellness, writeLook } = setup();
    await server.writeBlockChange({
      blockId: W,
      onDate: BASE_DATE,
      startsAt: "07:15",
      endsAt: "08:10",
    });
    await writeLook({ name: "Slow morning" });
    let read = await wellness();
    expect([read.startsAt, read.changed, read.block.name]).toEqual([
      "07:15",
      true,
      "Slow morning",
    ]);

    await server.writeBlockChange({
      blockId: W,
      onDate: BASE_DATE,
      startsAt: "07:20",
      endsAt: "08:10",
    });
    read = await wellness();
    expect([read.startsAt, read.block.name]).toEqual(["07:20", "Slow morning"]);
  });

  it("is put back by Undo", async () => {
    const { server, wellness, writeLook } = setup();
    const write = await writeLook({ name: "Slow morning" });
    await server.undo(write.undo);
    expect((await wellness()).block.name).toBe("Wellness");
  });
});

describe("an icon and colour from the day (C2)", () => {
  it("writes the icon and its colour on the date's change", () => {
    expect(
      todayLookInput(
        { blockId: W, date: BASE_DATE, startsAt: "07:05", endsAt: "08:00" },
        { icon: LEAF },
      ),
    ).toMatchObject({ icon: LEAF, color: "sage" });
    expect(colourOfIcon({ kind: "emoji", value: "🌿" })).toBeNull();
  });

  it("reads on Now, Schedule and Review the day for that date only", async () => {
    const { now, today, writeLook } = setup();
    await writeLook({ name: "Slow morning", icon: LEAF });

    const day = await today();
    const block = day.occurrences.blocks.find((o) => o.block.id === W)?.block;
    // Now, Schedule and Review the day all read this occurrence.
    expect([block?.icon, block?.color]).toEqual([LEAF, "sage"]);
    const reviewed = deriveReviewDay(day).blocks.find((b) => b.id === W);
    expect(reviewed?.name).toBe("Slow morning");
    const scheduled = deriveSchedule(day, now).blocks.find((b) => b.id === W);
    expect(scheduled?.name).toBe("Slow morning");

    const next = (await today(NEXT_WEEK)).occurrences.blocks.find(
      (o) => o.block.id === W,
    )?.block;
    expect([next?.name, next?.icon, next?.color]).not.toContain("sage");
    expect(next?.icon).not.toEqual(LEAF);
  });
});
