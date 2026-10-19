import { describe, expect, it } from "vitest";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { onSunday, SUNDAY_DATE } from "@/lib/fixtures/scenarios/now-forms";
import { createFixtureServer } from "@/lib/fixtures/server";
import {
  addChecklistItem,
  setBlockSpan,
  writeChecklist,
} from "./checklist-day";
import { deriveToday } from "./derive-today";
import type { TodayRecords } from "./today-records";
import { deriveReviewDay } from "./use-review-day";

/** The next Sunday: the usual Sunday, which a checklist for today never reaches. */
const NEXT_SUNDAY = "2026-10-25";

/** The usual week's rows: repeating blocks and their items. */
async function usualOf(read: Promise<TodayRecords>) {
  const records = await read;
  const blocks = records.blocks.filter((block) => block.onDate === null);
  const ids = new Set(blocks.map((block) => block.id));
  return {
    blocks,
    blockItems: records.blockItems.filter((item) => ids.has(item.blockId)),
  };
}

function setup(name = "review-sunday-nothing-set") {
  const server = createFixtureServer(
    resolveScenario(name),
    () => new Date(onSunday("08:40")),
  );
  return {
    server,
    records: () => server.readToday(SUNDAY_DATE),
    async view() {
      return deriveReviewDay(deriveToday(await server.readToday(SUNDAY_DATE)));
    },
  };
}

describe("C5: a checklist written for today through the fixtures", () => {
  it("starts from nothing set: the ask, no strip", async () => {
    const view = await setup().view();
    expect(view.empty).toBe(true);
    expect(view.allDay).toBeNull();
  });

  it("Make a checklist writes one dated checklist block named for the day", async () => {
    const { server, records, view } = setup();
    const usualBefore = await usualOf(server.readToday(NEXT_SUNDAY));

    const id = await writeChecklist(server, await records());
    // A second tap finds the same one.
    expect(await writeChecklist(server, await records())).toBe(id);

    const after = await records();
    const blocks = after.blocks.filter((block) => block.checklist);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({
      id,
      name: "Sunday",
      onDate: SUNDAY_DATE,
      rrule: null,
      startsAt: "00:00",
      endsAt: "24:00",
    });
    const shown = await view();
    expect(shown.empty).toBe(false);
    expect(shown.allDay).toMatchObject({ id, name: "Sunday", rows: [] });

    // The usual week is untouched: next Sunday reads as it did.
    expect(await usualOf(server.readToday(NEXT_SUNDAY))).toEqual(usualBefore);
    // Nothing new reaches next Sunday's day.
    const next = deriveToday(await server.readToday(NEXT_SUNDAY));
    expect(next.occurrences.blocks.some((row) => row.block.id === id)).toBe(
      false,
    );
  });

  it("Return adds the typed row as the checklist's last item", async () => {
    const { server, records, view } = setup();
    const id = await writeChecklist(server, await records());
    await addChecklistItem(server, await records(), id, "Groceries");
    await addChecklistItem(server, await records(), id, "Laundry");

    expect((await view()).allDay?.rows.map((row) => row.label)).toEqual([
      "Groceries",
      "Laundry",
    ]);
  });

  it("Set a time gives the block a span; it moves onto the rail with its items", async () => {
    const { server, records, view } = setup();
    const usualBefore = await usualOf(server.readToday(NEXT_SUNDAY));
    const id = await writeChecklist(server, await records());
    await addChecklistItem(server, await records(), id, "Groceries");
    await addChecklistItem(server, await records(), id, "Laundry");

    await setBlockSpan(server, id, "10:00", "13:00");

    const shown = await view();
    expect(shown.allDay).toBeNull();
    const block = shown.blocks.find((row) => row.id === id);
    expect(block).toMatchObject({ startsAt: "10:00", endsAt: "13:00" });
    expect(block?.items.map((item) => item.label)).toEqual([
      "Groceries",
      "Laundry",
    ]);
    expect(await usualOf(server.readToday(NEXT_SUNDAY))).toEqual(usualBefore);
  });
});

describe("Review the day on the Sunday with a checklist and plans", () => {
  it("draws the checklist as the strip and Lunch with Sam on the rail", async () => {
    const view = await setup("review-sunday-checklist-and-plans").view();
    expect(view.allDay?.rows.map((row) => row.label)).toEqual([
      "Groceries",
      "Laundry",
      "Water the plants",
      "Meal prep",
    ]);
    expect(view.events).toEqual([
      expect.objectContaining({
        title: "Lunch with Sam",
        startsAt: "13:00",
        endsAt: "14:30",
      }),
    ]);
    expect(view.blocks).toHaveLength(0);
    expect(view.startMin).toBeLessThanOrEqual(13 * 60);
    expect(view.endMin).toBeGreaterThanOrEqual(15 * 60);
  });

  it("resolves review-empty to the nothing-set frame (D-USE-68)", () => {
    expect(resolveScenario("review-empty").records.blocks).toEqual([]);
  });
});
