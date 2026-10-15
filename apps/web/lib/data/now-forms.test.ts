import { describe, expect, it } from "vitest";
import { nowBlockMenuRows } from "@/app/(shell)/today/_components/now/block-menu";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { checklistItemId } from "@/lib/fixtures/scenarios/now-forms";
import { createFixtureServer } from "@/lib/fixtures/server";
import { todayBlockRoute, todayScheduleRoute } from "@/lib/routes";
import { deriveToday } from "./derive-today";
import {
  checklistAddInput,
  deriveNow,
  doneChange,
  type NowItemView,
} from "./use-now";

/**
 * Now's other block forms (USE-17) on the fixture server, read back through
 * `deriveNow` as the screen reads them. Each scenario's own minute, or a
 * later one, is the clock.
 */
function setup(name: string, at?: string) {
  const scenario = resolveScenario(name);
  const nowMs = Date.parse(at ?? scenario.now);
  const now = () => new Date(nowMs);
  const server = createFixtureServer(scenario, now);
  const dateKey = scenario.now.slice(0, 10);
  async function read() {
    return deriveNow(deriveToday(await server.readToday(dateKey)), now(), null);
  }
  async function check(blockId: string, item: NowItemView) {
    const slotId =
      item.slotId ??
      (
        await server.writeSlots({
          blockId,
          onDate: dateKey,
          sortOrder: item.sortOrder,
          blockItemId: item.blockItemId,
        })
      ).id;
    return server.writeSlots({ id: slotId, ...doneChange(item, now()) });
  }
  return { server, dateKey, now, read, check };
}

describe("behind the plan", () => {
  it("at 8:04 Wellness stays active, behind since 8:00, the card as at 7:14", async () => {
    const view = await setup("behind").read();
    expect(view.block).toMatchObject({
      name: "Wellness",
      form: "items",
      behindSince: "08:00",
    });
    expect(view.current?.title).toBe("Meditate");
    expect(view.current?.plannedAt).toBe("07:10");
  });

  it("is not behind at 7:14", async () => {
    const view = await setup("success").read();
    expect(view.block?.behindSince).toBeNull();
  });
});

describe("a meal between blocks", () => {
  it("at 9:02 Breakfast is a meal: one item, 30 min at 9:00", async () => {
    const view = await setup("transition").read();
    expect(view.block).toMatchObject({
      name: "Breakfast",
      form: "meal",
      startsAt: "09:00",
      endsAt: "09:30",
      behindSince: null,
    });
    expect(view.items).toHaveLength(1);
    expect(view.current).toMatchObject({
      title: "Breakfast",
      lengthMin: 30,
      plannedAt: "09:00",
    });
  });
});

describe("before Ready, go", () => {
  it("is read from the day record: readyAt null is before go, with the day's blocks", async () => {
    const view = await setup("before-ready-go").read();
    expect(view.phase).toBe("before-go");
    expect(
      view.dayBlocks.map((block) => [block.name, block.startsAt, block.meal]),
    ).toEqual([
      ["Wellness", "07:05", false],
      ["Training", "08:00", false],
      ["Breakfast", "09:00", true],
      ["Work", "09:30", false],
    ]);
  });

  it("is live once readied", async () => {
    expect((await setup("success").read()).phase).toBe("live");
  });
});

describe("C8: a Checklist block", () => {
  it("reads as a checklist with no current item and no lengths", async () => {
    const view = await setup("checklist-block").read();
    expect(view.block).toMatchObject({
      name: "Sunday reset",
      form: "checklist",
      startsAt: "10:00",
      endsAt: "13:00",
    });
    expect(view.items.map((item) => [item.title, item.done])).toEqual([
      ["Groceries", false],
      ["Laundry", false],
      ["Water the plants", true],
      ["Meal prep", false],
      ["Tidy the flat", false],
      ["Plan the week", false],
    ]);
    expect(view.items.every((item) => item.lengthMin === null)).toBe(true);
    expect(view.current).toBeNull();
  });

  it("checking rows out of order completes each in place and leaves current null", async () => {
    const { read, check } = setup("checklist-block");
    const before = await read();
    const blockId = before.block!.id;
    const order = before.items.map((item) => item.id);
    const plan = before.items.find((item) => item.title === "Plan the week")!;
    const laundry = before.items.find((item) => item.title === "Laundry")!;
    await check(blockId, plan);
    await check(blockId, laundry);
    const after = await read();
    expect(after.items.map((item) => item.id)).toEqual(order);
    expect(
      after.items.filter((item) => item.done).map((item) => item.title),
    ).toEqual(["Laundry", "Water the plants", "Plan the week"]);
    expect(after.current).toBeNull();
    expect(after.next).toBeNull();
  });
});

describe("C8: the checklist day", () => {
  it("at 11:20 is the all-day checklist, next Lunch with Sam at 13:00", async () => {
    const view = await setup("sunday-checklist").read();
    expect(view.block).toMatchObject({
      name: "Sunday",
      form: "all-day-checklist",
      behindSince: null,
      next: { name: "Lunch with Sam", startsAt: "13:00" },
    });
    expect(view.current).toBeNull();
  });

  it("Lunch with Sam lifts above it at 13:00 and the checklist returns after", async () => {
    const at = (clock: string) => `2026-10-18T${clock}:00-04:00`;
    const lunch = await setup("sunday-checklist", at("13:00")).read();
    expect(lunch.block?.name).toBe("Lunch with Sam");
    const after = await setup("sunday-checklist", at("14:30")).read();
    expect(after.block).toMatchObject({ name: "Sunday", next: null });
  });

  it("Add to the checklist adds a row at the end, on this date", async () => {
    const { server, read, dateKey } = setup("sunday-checklist");
    const before = await read();
    const input = checklistAddInput(
      before.block!.id,
      dateKey,
      "Call Mum",
      before.items,
    );
    expect(input).toMatchObject({ onDate: "2026-10-18", sortOrder: 6 });
    await server.writeBlockItem(input);
    const after = await read();
    expect(after.items.map((item) => item.title)).toEqual([
      ...before.items.map((item) => item.title),
      "Call Mum",
    ]);
    expect(after.items.at(-1)).toMatchObject({ done: false, lengthMin: null });
    // Another of the same is a second row; the field stays open for it.
    await server.writeBlockItem(
      checklistAddInput(before.block!.id, dateKey, "Bins", after.items),
    );
    expect((await read()).items.at(-1)?.title).toBe("Bins");
  });

  it("a row's id is the fixture's, so a capture's row is the board's", () => {
    expect(checklistItemId("day", 2)).not.toBe(checklistItemId("reset", 2));
  });
});

describe("C8: ··· on the header", () => {
  it("Complete Wellness, Edit block, then See the whole day to Schedule", () => {
    let completed = false;
    const rows = nowBlockMenuRows({ id: "b1", name: "Wellness" }, () => {
      completed = true;
    });
    expect(rows.map((row) => row.label)).toEqual([
      "Complete Wellness",
      "Edit block",
      "See the whole day",
    ]);
    expect(rows[1]?.href).toBe(todayBlockRoute("b1"));
    expect(rows[2]).toMatchObject({
      href: todayScheduleRoute(),
      separated: true,
    });
    rows[0]?.onSelect?.();
    expect(completed).toBe(true);
  });
});
